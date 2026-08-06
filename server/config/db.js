import pg from 'pg';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { supabase } from './supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbEngine = 'supabase';
let pgPool = null;
let sqliteDb = null;

export async function getDb() {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    dbEngine = 'pg';
    if (!pgPool) {
      pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
      });
    }
    return { engine: 'pg', client: pgPool };
  } else if (process.env.SUPABASE_URL && process.env.SUPABASE_URL.trim() !== '') {
    dbEngine = 'supabase';
    return { engine: 'supabase', client: supabase };
  } else {
    dbEngine = 'sqlite';
    if (!sqliteDb) {
      const dbPath = path.join(__dirname, '..', 'database', 'ecohub.sqlite');
      sqliteDb = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
    }
    return { engine: 'sqlite', client: sqliteDb };
  }
}

export async function query(sql, params = []) {
  const { engine, client } = await getDb();

  if (engine === 'pg') {
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    const res = await client.query(pgSql, params);
    return { rows: res.rows, rowCount: res.rowCount, lastID: res.rows[0]?.id };
  } 
  else if (engine === 'supabase') {
    try {
      const cleanSql = sql.trim();
      const lowerSql = cleanSql.toLowerCase();

      // ──────── SELECT ────────
      if (lowerSql.startsWith('select')) {

        // --- users ---
        if (lowerSql.includes('from users')) {
          let builder = supabase.from('users').select('*');
          if (lowerSql.includes('where email =')) builder = builder.eq('email', params[0]);
          else if (lowerSql.includes('where id =')) builder = builder.eq('id', params[0]);
          const { data, error } = await builder;
          if (error) throw error;
          return { rows: data || [], rowCount: data ? data.length : 0 };
        }

        // --- farms ---
        if (lowerSql.includes('from farms')) {
          let builder = supabase.from('farms').select('*');
          if (lowerSql.includes('where user_id = ?') && lowerSql.includes('and crop = ?')) {
            builder = builder.eq('user_id', params[0]).eq('crop', params[1]);
          } else if (lowerSql.includes('where user_id =')) {
            builder = builder.eq('user_id', params[0]);
          }
          builder = builder.order('id', { ascending: false });
          if (lowerSql.includes('limit 1')) builder = builder.limit(1);
          const { data, error } = await builder;
          if (error) throw error;
          return { rows: data || [], rowCount: data ? data.length : 0 };
        }

        // --- calendar_events ---
        if (lowerSql.includes('from calendar_events')) {
          let builder = supabase.from('calendar_events').select('*');
          if (lowerSql.includes('where user_id = ?') && lowerSql.includes('date >=')) {
            builder = builder.eq('user_id', params[0]).gte('date', params[1]).order('date', { ascending: true }).limit(5);
          } else if (lowerSql.includes('where id = ?') && lowerSql.includes('user_id')) {
            builder = builder.eq('id', params[0]).eq('user_id', params[1]);
          } else if (lowerSql.includes('where user_id =')) {
            builder = builder.eq('user_id', params[0]).order('date', { ascending: true });
          }
          const { data, error } = await builder;
          if (error) throw error;
          return { rows: data || [], rowCount: data ? data.length : 0 };
        }

        // --- machinery ---
        if (lowerSql.includes('from machinery')) {
          if (lowerSql.includes('where id =')) {
            const { data, error } = await supabase.from('machinery').select('*').eq('id', params[0]);
            if (error) throw error;
            return { rows: data || [], rowCount: data ? data.length : 0 };
          }
          if (lowerSql.includes('count(*)')) {
            const { count, error } = await supabase.from('machinery').select('*', { count: 'exact', head: true });
            if (error) throw error;
            return { rows: [{ count: count || 0 }], rowCount: 1 };
          }
          let builder = supabase.from('machinery').select('*').eq('availability', true);
          if (params.length === 1 && params[0] !== 'All') builder = builder.eq('type', params[0]);
          else if (params.length === 2) {
            if (params[0] !== 'All') builder = builder.eq('type', params[0]);
            builder = builder.ilike('location', `%${params[1]}%`);
          }
          const { data, error } = await builder.order('id', { ascending: false });
          if (error) throw error;
          return { rows: data || [], rowCount: data ? data.length : 0 };
        }

        // --- machine_bookings ---
        if (lowerSql.includes('from machine_bookings')) {
          if (lowerSql.includes('count(*)')) {
            const { count, error } = await supabase.from('machine_bookings').select('*', { count: 'exact', head: true })
              .eq('user_id', params[0]).eq('status', 'confirmed');
            if (error) throw error;
            return { rows: [{ count: count || 0 }], rowCount: 1 };
          }
          const { data, error } = await supabase.from('machine_bookings').select('*, machinery(*)').eq('user_id', params[0]).order('id', { ascending: false });
          if (error) throw error;
          const mapped = (data || []).map(b => ({
            ...b,
            machine_name: b.machinery?.machine_name,
            owner: b.machinery?.owner,
            type: b.machinery?.type,
            location: b.machinery?.location,
            image_url: b.machinery?.image_url,
            rent: b.machinery?.rent
          }));
          return { rows: mapped, rowCount: mapped.length };
        }

        // --- cold_storages ---
        if (lowerSql.includes('from cold_storages')) {
          if (lowerSql.includes('where id =')) {
            const { data, error } = await supabase.from('cold_storages').select('*').eq('id', params[0]);
            if (error) throw error;
            return { rows: data || [], rowCount: data ? data.length : 0 };
          }
          if (lowerSql.includes('count(*)')) {
            const { count, error } = await supabase.from('cold_storages').select('*', { count: 'exact', head: true });
            if (error) throw error;
            return { rows: [{ count: count || 0 }], rowCount: 1 };
          }
          let builder = supabase.from('cold_storages').select('*');
          if (params.length > 0 && params[0]) builder = builder.ilike('location', `%${params[0]}%`);
          const { data, error } = await builder.order('id', { ascending: false });
          if (error) throw error;
          return { rows: data || [], rowCount: data ? data.length : 0 };
        }

        // --- storage_bookings ---
        if (lowerSql.includes('from storage_bookings')) {
          if (lowerSql.includes('count(*)')) {
            const { count, error } = await supabase.from('storage_bookings').select('*', { count: 'exact', head: true })
              .eq('user_id', params[0]).eq('status', 'confirmed');
            if (error) throw error;
            return { rows: [{ count: count || 0 }], rowCount: 1 };
          }
          const { data, error } = await supabase.from('storage_bookings').select('*, cold_storages(*)').eq('user_id', params[0]).order('id', { ascending: false });
          if (error) throw error;
          const mapped = (data || []).map(b => ({
            ...b,
            storage_name: b.cold_storages?.name,
            location: b.cold_storages?.location,
            price_per_ton_day: b.cold_storages?.price,
            image_url: b.cold_storages?.image_url
          }));
          return { rows: mapped, rowCount: mapped.length };
        }

        // --- recommendations ---
        if (lowerSql.includes('from recommendations')) {
          if (lowerSql.includes('count(*)')) {
            const { count, error } = await supabase.from('recommendations').select('*', { count: 'exact', head: true }).eq('user_id', params[0]);
            if (error) throw error;
            return { rows: [{ count: count || 0 }], rowCount: 1 };
          }
          const { data, error } = await supabase.from('recommendations').select('*, farms(*)').eq('user_id', params[0]).order('id', { ascending: false }).limit(10);
          if (error) throw error;
          const mapped = (data || []).map(r => ({
            ...r,
            crop: r.farms?.crop,
            location: r.farms?.location,
            soil_type: r.farms?.soil_type,
            crop_stage: r.farms?.crop_stage
          }));
          return { rows: mapped, rowCount: mapped.length };
        }

        // --- notifications ---
        if (lowerSql.includes('from notifications')) {
          if (lowerSql.includes('count(*)')) {
            const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true })
              .eq('user_id', params[0]).eq('is_read', false);
            if (error) throw error;
            return { rows: [{ count: count || 0 }], rowCount: 1 };
          }
          const { data, error } = await supabase.from('notifications').select('*').eq('user_id', params[0]).order('id', { ascending: false }).limit(50);
          if (error) throw error;
          return { rows: data || [], rowCount: data ? data.length : 0 };
        }
      }

      // ──────── INSERT ────────
      if (lowerSql.startsWith('insert')) {

        if (lowerSql.includes('into users')) {
          const { data, error } = await supabase.from('users').insert([{ name: params[0], phone: params[1], email: params[2], password: params[3] }]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1, lastID: data?.[0]?.id };
        }

        if (lowerSql.includes('into farms')) {
          const { data, error } = await supabase.from('farms').insert([{
            user_id: params[0], crop: params[1], location: params[2],
            soil_type: params[3], crop_stage: params[4], size_acres: params[5] || 5.0
          }]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1, lastID: data?.[0]?.id };
        }

        if (lowerSql.includes('into calendar_events')) {
          let eventObj;
          if (params.length === 5) {
            eventObj = { user_id: params[0], title: params[1], date: params[2], type: params[3], status: 'pending', description: params[4] };
          } else {
            if (lowerSql.includes('type, description, status')) {
              eventObj = { user_id: params[0], title: params[1], date: params[2], type: params[3], description: params[4] || '', status: params[5] || 'pending' };
            } else {
              eventObj = { user_id: params[0], title: params[1], date: params[2], type: params[3], status: params[4] || 'pending', description: params[5] || '' };
            }
          }
          const { data, error } = await supabase.from('calendar_events').insert([eventObj]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1, lastID: data?.[0]?.id };
        }

        if (lowerSql.includes('into machinery')) {
          const { data, error } = await supabase.from('machinery').insert([{
            owner: params[0], machine_name: params[1], type: params[2],
            location: params[3], lat: params[4], lng: params[5],
            rent: params[6], image_url: params[7], description: params[8]
          }]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1, lastID: data?.[0]?.id };
        }

        if (lowerSql.includes('into machine_bookings')) {
          const { data, error } = await supabase.from('machine_bookings').insert([{
            user_id: params[0], machine_id: params[1],
            booking_date: params[2], end_date: params[3],
            status: 'confirmed', total_price: params[4]
          }]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1, lastID: data?.[0]?.id };
        }

        if (lowerSql.includes('into cold_storages')) {
          const { data, error } = await supabase.from('cold_storages').insert([{
            name: params[0], location: params[1], lat: params[2], lng: params[3],
            capacity: params[4], price: params[5], available_capacity: params[6], image_url: params[7]
          }]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1, lastID: data?.[0]?.id };
        }

        if (lowerSql.includes('into storage_bookings')) {
          const { data, error } = await supabase.from('storage_bookings').insert([{
            user_id: params[0], storage_id: params[1], booking_date: params[2],
            duration_days: params[3], quantity_tons: params[4],
            status: 'confirmed', total_price: params[5]
          }]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1, lastID: data?.[0]?.id };
        }

        if (lowerSql.includes('into recommendations')) {
          const { data, error } = await supabase.from('recommendations').insert([{
            farm_id: params[0], user_id: params[1], ai_response: params[2]
          }]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1, lastID: data?.[0]?.id };
        }

        if (lowerSql.includes('into notifications')) {
          const { data, error } = await supabase.from('notifications').insert([{
            user_id: params[0], title: params[1], message: params[2], type: params[3] || 'info'
          }]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1, lastID: data?.[0]?.id };
        }
      }

      // ──────── UPDATE ────────
      if (lowerSql.startsWith('update')) {

        if (lowerSql.includes('farms set')) {
          const { data, error } = await supabase.from('farms')
            .update({ location: params[0], soil_type: params[1], crop_stage: params[2] })
            .eq('id', params[3]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1 };
        }

        if (lowerSql.includes('calendar_events set')) {
          const { data, error } = await supabase.from('calendar_events')
            .update({ title: params[0], date: params[1], type: params[2], status: params[3], description: params[4] })
            .eq('id', params[5]).eq('user_id', params[6]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1 };
        }

        if (lowerSql.includes('machine_bookings set status')) {
          const { data, error } = await supabase.from('machine_bookings')
            .update({ status: 'cancelled' })
            .eq('id', params[0]).eq('user_id', params[1]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1 };
        }

        if (lowerSql.includes('cold_storages set available_capacity')) {
          const { data, error } = await supabase.from('cold_storages')
            .update({ available_capacity: params[0] })
            .eq('id', params[1]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1 };
        }

        if (lowerSql.includes('notifications set is_read')) {
          let builder = supabase.from('notifications').update({ is_read: true });
          if (params.length === 1) builder = builder.eq('user_id', params[0]);
          else builder = builder.eq('id', params[0]).eq('user_id', params[1]);
          const { data, error } = await builder.select();
          if (error) throw error;
          return { rows: data || [], rowCount: data ? data.length : 0 };
        }
      }

      // ──────── DELETE ────────
      if (lowerSql.startsWith('delete')) {
        if (lowerSql.includes('from calendar_events')) {
          const { data, error } = await supabase.from('calendar_events')
            .delete().eq('id', params[0]).eq('user_id', params[1]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: data ? data.length : 0 };
        }

        if (lowerSql.includes('from farms')) {
          let builder = supabase.from('farms').delete().eq('id', params[0]);
          if (params.length > 1) builder = builder.eq('user_id', params[1]);
          const { data, error } = await builder.select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1 };
        }

        if (lowerSql.includes('from machinery')) {
          const { data, error } = await supabase.from('machinery')
            .delete().eq('id', params[0]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1 };
        }

        if (lowerSql.includes('from cold_storages')) {
          const { data, error } = await supabase.from('cold_storages')
            .delete().eq('id', params[0]).select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1 };
        }

        if (lowerSql.includes('from machine_bookings')) {
          let builder = supabase.from('machine_bookings').delete().eq('id', params[0]);
          if (params.length > 1) builder = builder.eq('user_id', params[1]);
          const { data, error } = await builder.select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1 };
        }

        if (lowerSql.includes('from storage_bookings')) {
          let builder = supabase.from('storage_bookings').delete().eq('id', params[0]);
          if (params.length > 1) builder = builder.eq('user_id', params[1]);
          const { data, error } = await builder.select();
          if (error) throw error;
          return { rows: data || [], rowCount: 1 };
        }
      }

      // Fallback
      return { rows: [], rowCount: 0 };

    } catch (err) {
      console.error('[Supabase Query Error]', err.message);
      throw err;
    }
  } 
  else {
    // ──────── SQLite Engine ────────
    const lowerSql = sql.trim().toLowerCase();
    if (lowerSql.startsWith('select') || lowerSql.includes('returning')) {
      let cleanSql = sql.replace(/RETURNING\s+.*/i, '').trim();
      if (lowerSql.startsWith('select')) {
        const rows = await client.all(cleanSql, params);
        return { rows, rowCount: rows.length };
      } else {
        const res = await client.run(cleanSql, params);
        if (/RETURNING/i.test(sql)) {
          const tableName = cleanSql.toLowerCase().includes('into users') ? 'users' :
                            cleanSql.toLowerCase().includes('into farms') ? 'farms' :
                            cleanSql.toLowerCase().includes('into calendar_events') ? 'calendar_events' :
                            cleanSql.toLowerCase().includes('into machinery') ? 'machinery' :
                            cleanSql.toLowerCase().includes('into machine_bookings') ? 'machine_bookings' :
                            cleanSql.toLowerCase().includes('into cold_storages') ? 'cold_storages' :
                            cleanSql.toLowerCase().includes('into storage_bookings') ? 'storage_bookings' :
                            cleanSql.toLowerCase().includes('into recommendations') ? 'recommendations' :
                            'notifications';
          const inserted = await client.get(`SELECT * FROM ${tableName} WHERE id = ?`, [res.lastID]);
          return { rows: [inserted], rowCount: 1, lastID: res.lastID };
        }
        return { rows: [], rowCount: res.changes, lastID: res.lastID };
      }
    } else {
      const res = await client.run(sql, params);
      return { rows: [], rowCount: res.changes, lastID: res.lastID };
    }
  }
}

export async function initDatabase() {
  const { engine } = await getDb();
  console.log(`[Database] Connected to live ${engine.toUpperCase()} engine...`);
}
