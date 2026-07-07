import { createClient } from '@supabase/supabase-js';

// Retrieve configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;
const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required.');
  process.exit(1);
}

if (!EXTERNAL_API_URL) {
  console.warn('Warning: EXTERNAL_API_URL environment variable is not set. Using placeholder data for sync.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetches the student/roster data from the external API.
 */
async function fetchExternalData() {
  if (!EXTERNAL_API_URL) {
    // Fallback placeholder mock data to verify Supabase integration works
    console.log('No EXTERNAL_API_URL set. Returning demo student data for sync...');
    return [
      { name: 'Adil Khan', dars: 'Imam Navavi Garden', class: 'HS1' },
      { name: 'Suhail Ibrahim', dars: 'Imam Rafi Garden', class: 'HS2' },
      { name: 'Faisal Rahman', dars: 'Imam Gazli Garden', class: 'BS1' },
      { name: 'Zayan Ali', dars: 'RootExc', class: 'BS2' }
    ];
  }

  console.log(`Fetching data from external API: ${EXTERNAL_API_URL}`);
  
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (EXTERNAL_API_KEY) {
    headers['Authorization'] = `Bearer ${EXTERNAL_API_KEY}`;
  }

  const response = await fetch(EXTERNAL_API_URL, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from API: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Upserts the fetched records to the Supabase database.
 */
async function syncToDatabase(records) {
  console.log(`Syncing ${records.length} records to Supabase 'students' table...`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    if (!record.name || !record.dars) {
      console.warn('Skipping invalid record: Missing name or dars field.', record);
      errorCount++;
      continue;
    }

    try {
      // Syncing records to the 'students' table.
      // Upsert will insert a new student or update their details if they match on the unique constraint (name, dars, class)
      const { data, error } = await supabase
        .from('students')
        .upsert({
          name: record.name.trim(),
          dars: record.dars.trim(),
          class: record.class ? record.class.trim() : 'HS1'
        }, {
          onConflict: 'name,dars,class'
        });

      if (error) {
        console.error(`Failed to upsert student ${record.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`Successfully synced: ${record.name} (${record.dars} - ${record.class || 'HS1'})`);
        successCount++;
      }
    } catch (err) {
      console.error(`Error syncing student ${record.name}:`, err);
      errorCount++;
    }
  }

  console.log(`Database sync summary - Completed. Successful updates: ${successCount}, Failed updates: ${errorCount}`);
}

async function main() {
  try {
    const data = await fetchExternalData();
    
    // Support either direct array payload or wrapping data object
    const records = Array.isArray(data) ? data : (data.students || data.data || []);
    
    if (!Array.isArray(records)) {
      throw new Error('API response does not contain a valid array of student records.');
    }

    await syncToDatabase(records);
    console.log('Weekly sync completed successfully.');
  } catch (err) {
    console.error('Sync process failed with a critical error:', err);
    process.exit(1);
  }
}

main();
