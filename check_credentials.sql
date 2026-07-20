-- Verificar si se guardaron las credenciales
SELECT 
  user_id,
  company_id,
  rut_sii,
  credenciales_sii_encriptadas,
  updated_at
FROM user_company
WHERE user_id = 'f1f338af-2ff3-4a32-a2dc-679ff02d3c45'
ORDER BY updated_at DESC;
