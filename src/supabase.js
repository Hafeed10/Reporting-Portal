import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or dynamic local storage setting
const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_anon_key');
  
  return {
    url: envUrl || localUrl || '',
    key: envKey || localKey || '',
    isEnv: !!(envUrl && envKey)
  };
};

const credentials = getSupabaseCredentials();

// Initialize actual Supabase client if credentials exist
export const supabase = (credentials.url && credentials.key) 
  ? createClient(credentials.url, credentials.key)
  : null;

export const isSupabaseConfigured = () => {
  const creds = getSupabaseCredentials();
  return !!(creds.url && creds.key);
};

export const getSupabaseConfig = () => {
  return getSupabaseCredentials();
};

export const saveSupabaseConfig = (url, key) => {
  if (url && key) {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_anon_key', key);
  } else {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
  }
  window.location.reload();
};

const checkConfigured = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please connect to your database using the settings icon in the header.');
  }
};

// Columns that were added in later migrations — the app works without them
const OPTIONAL_COLUMNS = ['books_read', 'writing_activities'];

/**
 * Strips optional columns from the payload if Supabase reports a schema cache
 * error for them.  Returns the safe payload to use on retry.
 */
const stripMissingColumn = (data, errorMessage) => {
  if (!errorMessage) return data;
  const stripped = { ...data };
  for (const col of OPTIONAL_COLUMNS) {
    if (errorMessage.includes(`'${col}'`)) {
      delete stripped[col];
      console.warn(`Supabase schema missing column '${col}' — retrying without it.`);
    }
  }
  return stripped;
};

// Unified Data Access API
export const reportService = {
  async getAll() {
    checkConfigured();
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .order('report_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching from Supabase:', error);
      throw error;
    }
    return data;
  },

  async getById(id) {
    checkConfigured();
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching report ${id}:`, error);
      throw error;
    }
    return data;
  },

  async create(reportData) {
    checkConfigured();
    let payload = { ...reportData };

    // First attempt
    let { data, error } = await supabase
      .from('monthly_reports')
      .insert([payload])
      .select()
      .single();

    // If Supabase complains about a missing optional column, strip it and retry
    if (error && error.message && error.message.includes('schema cache')) {
      payload = stripMissingColumn(payload, error.message);
      const retry = await supabase
        .from('monthly_reports')
        .insert([payload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Error inserting to Supabase:', error);
      throw error;
    }
    return data;
  },

  async update(id, reportData) {
    checkConfigured();
    let payload = { ...reportData };

    // First attempt
    let { data, error } = await supabase
      .from('monthly_reports')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    // If Supabase complains about a missing optional column, strip it and retry
    if (error && error.message && error.message.includes('schema cache')) {
      payload = stripMissingColumn(payload, error.message);
      const retry = await supabase
        .from('monthly_reports')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error(`Error updating report ${id}:`, error);
      throw error;
    }
    return data;
  },

  async delete(id) {
    checkConfigured();
    let query = supabase.from('monthly_reports').delete();
    if (Array.isArray(id)) {
      query = query.in('id', id);
    } else {
      query = query.eq('id', id);
    }
    const { error } = await query;
      
    if (error) {
      console.error(`Error deleting report(s) ${id}:`, error);
      throw error;
    }
    return true;
  }
};

export const studentService = {
  async getAll() {
    checkConfigured();
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching students from Supabase:', error);
      throw error;
    }
    return data;
  },

  async create(name, dars, classLevel) {
    checkConfigured();
    const { data, error } = await supabase
      .from('students')
      .insert([{ name, dars, class: classLevel }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating student in Supabase:', error);
      throw error;
    }
    return data;
  },

  async delete(name, dars, classLevel) {
    checkConfigured();
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('name', name)
      .eq('dars', dars)
      .eq('class', classLevel);
      
    if (error) {
      console.error('Error deleting student from Supabase:', error);
      throw error;
    }
    return true;
  }
};

export const dailyAttendanceService = {
  async getAll() {
    checkConfigured();
    const { data, error } = await supabase
      .from('daily_subject_attendance')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching daily attendance from Supabase:', error);
      throw error;
    }
    return data;
  },

  async save(record) {
    checkConfigured();
    
    // If id is provided, update by id directly
    if (record.id) {
      const { id, ...updateData } = record;
      const { data, error } = await supabase
        .from('daily_subject_attendance')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    // Otherwise lookup by date, class, subject, period
    const { data: existing, error: checkError } = await supabase
      .from('daily_subject_attendance')
      .select('id')
      .eq('date', record.date)
      .eq('class', record.class)
      .eq('subject', record.subject)
      .eq('period', record.period)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('daily_subject_attendance')
        .update({
          faculty: record.faculty,
          records: record.records
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { id, ...insertData } = record;
      const { data, error } = await supabase
        .from('daily_subject_attendance')
        .insert([insertData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async delete(id) {
    checkConfigured();
    let query = supabase.from('daily_subject_attendance').delete();
    if (Array.isArray(id)) {
      query = query.in('id', id);
    } else {
      query = query.eq('id', id);
    }
    const { error } = await query;
    
    if (error) {
      throw error;
    }
    return true;
  }
};
