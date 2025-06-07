-- Verificar y corregir las políticas RLS para la tabla weather_entries

-- 1. Primero, eliminar las políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can view own weather entries" ON weather_entries;
DROP POLICY IF EXISTS "Users can insert own weather entries" ON weather_entries;
DROP POLICY IF EXISTS "Users can update own weather entries" ON weather_entries;
DROP POLICY IF EXISTS "Users can delete own weather entries" ON weather_entries;

-- 2. Asegurarse de que RLS está habilitado
ALTER TABLE weather_entries ENABLE ROW LEVEL SECURITY;

-- 3. Recrear las políticas con definiciones más permisivas para debugging
-- Política para SELECT: permitir a los usuarios ver sus propias entradas
CREATE POLICY "Users can view own weather entries" ON weather_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Política para INSERT: permitir a los usuarios insertar entradas donde user_id = auth.uid()
CREATE POLICY "Users can insert own weather entries" ON weather_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: permitir a los usuarios actualizar sus propias entradas
CREATE POLICY "Users can update own weather entries" ON weather_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE: permitir a los usuarios eliminar sus propias entradas
CREATE POLICY "Users can delete own weather entries" ON weather_entries
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Verificar que la tabla existe y tiene la estructura correcta
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'weather_entries'
);
