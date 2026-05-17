use rusqlite::{Connection, Result};
use std::path::Path;

pub fn init_db(db_path: &Path) -> Result<Connection> {
    let conn = Connection::open(db_path)?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            source_url TEXT,
            storage_path TEXT NOT NULL,
            is_public INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_photos_is_public ON photos(is_public)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at)",
        [],
    )?;

    Ok(conn)
}

pub fn get_connection() -> Result<Connection, Box<dyn std::error::Error>> {
    let db_path = std::env::var("DATABASE_URL").unwrap_or_else(|_| "photo_wall.db".to_string());
    let conn = Connection::open(&db_path)?;
    Ok(conn)
}
