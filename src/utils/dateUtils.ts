/**
 * Converte uma data para o fuso horário brasileiro (UTC-3)
 * Subtrai 3 horas da data original para converter para o horário brasileiro
 * Exemplo: se a data é 17:00, retorna 14:00
 */
export function toBrazilianTimezone(date: Date): Date {
  // Criar uma cópia da data para não modificar a original
  const brazilianDate = new Date(date);
  
  // Subtrair 3 horas (3 * 60 * 60 * 1000 milissegundos)
  // O fuso horário brasileiro é UTC-3 
  brazilianDate.setHours(brazilianDate.getHours() - 3);
  
  return brazilianDate;
}

