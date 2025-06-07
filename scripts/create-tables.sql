-- Crear tabla de usuarios (Supabase Auth se encarga de esto automáticamente)
-- Crear tabla de entradas del diario del clima
CREATE TABLE IF NOT EXISTS weather_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  city VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  temperature DECIMAL(5,2),
  weather_condition VARCHAR(100),
  weather_description VARCHAR(200),
  humidity INTEGER,
  wind_speed DECIMAL(5,2),
  personal_note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_weather_entries_user_id ON weather_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_entries_date ON weather_entries(date);

-- Habilitar RLS (Row Level Security)
ALTER TABLE weather_entries ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propias entradas
CREATE POLICY "Users can view own weather entries" ON weather_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weather entries" ON weather_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weather entries" ON weather_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weather entries" ON weather_entries
  FOR DELETE USING (auth.uid() = user_id);
