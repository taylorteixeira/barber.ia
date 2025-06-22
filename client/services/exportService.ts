import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export interface AppointmentExport {
  id: string;
  date: string;
  time: string;
  client: string;
  service: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  phone: string;
  email?: string;
  price: number;
  notes?: string;
  createdAt: string;
  barber?: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  startDate: string;
  endDate: string;
  barberId?: string;
  status?: string[];
}

// Função para filtrar agendamentos por período e critérios
export const filterAppointments = (
  appointments: AppointmentExport[],
  options: ExportOptions
): AppointmentExport[] => {
  return appointments.filter(appointment => {
    // Filtro por data
    const appointmentDate = new Date(appointment.date);
    const startDate = new Date(options.startDate);
    const endDate = new Date(options.endDate);
    
    if (appointmentDate < startDate || appointmentDate > endDate) {
      return false;
    }
    
    // Filtro por barbeiro (se especificado)
    if (options.barberId && appointment.barber !== options.barberId) {
      return false;
    }
    
    // Filtro por status (se especificado)
    if (options.status && options.status.length > 0 && !options.status.includes(appointment.status)) {
      return false;
    }
    
    return true;
  });
};

// Função para gerar CSV
export const generateCSV = (appointments: AppointmentExport[]): string => {
  const headers = [
    'Data',
    'Horário',
    'Cliente',
    'Telefone',
    'Email',
    'Serviço',
    'Duração (min)',
    'Valor (R$)',
    'Status',
    'Barbeiro',
    'Observações',
    'Data Criação'
  ].join(',');
  
  const rows = appointments.map(appointment => [
    appointment.date,
    appointment.time,
    `"${appointment.client}"`,
    appointment.phone,
    appointment.email || '',
    `"${appointment.service}"`,
    appointment.duration.toString(),
    appointment.price.toFixed(2),
    appointment.status,
    appointment.barber || '',
    `"${appointment.notes || ''}"`,
    new Date(appointment.createdAt).toLocaleDateString('pt-BR')
  ].join(','));
  
  return [headers, ...rows].join('\n');
};

// Função para gerar HTML para PDF
export const generateHTML = (appointments: AppointmentExport[], options: ExportOptions): string => {
  const totalValue = appointments.reduce((sum, apt) => sum + apt.price, 0);
  const totalAppointments = appointments.length;
  
  const statusMap = {
    confirmed: 'Confirmado',
    pending: 'Pendente',
    cancelled: 'Cancelado',
    completed: 'Concluído'
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Agendamentos - Barber.IA</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #059669;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #059669;
          margin: 0;
          font-size: 28px;
        }
        .header h2 {
          color: #666;
          margin: 5px 0;
          font-size: 18px;
          font-weight: normal;
        }
        .summary {
          display: flex;
          justify-content: space-around;
          margin: 20px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #059669;
        }
        .summary-label {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #059669;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          text-align: center;
        }
        .status.confirmed { background-color: #d1fae5; color: #065f46; }
        .status.pending { background-color: #fef3c7; color: #92400e; }
        .status.cancelled { background-color: #fee2e2; color: #991b1b; }
        .status.completed { background-color: #dbeafe; color: #1e40af; }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Barber.IA</h1>
        <h2>Relatório de Agendamentos</h2>
        <p>Período: ${new Date(options.startDate).toLocaleDateString('pt-BR')} a ${new Date(options.endDate).toLocaleDateString('pt-BR')}</p>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${totalAppointments}</div>
          <div class="summary-label">Agendamentos</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">R$ ${totalValue.toFixed(2)}</div>
          <div class="summary-label">Receita Total</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">R$ ${totalAppointments > 0 ? (totalValue / totalAppointments).toFixed(2) : '0.00'}</div>
          <div class="summary-label">Ticket Médio</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Horário</th>
            <th>Cliente</th>
            <th>Telefone</th>
            <th>Serviço</th>
            <th>Duração</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Observações</th>
          </tr>
        </thead>
        <tbody>
          ${appointments.map(appointment => `
            <tr>
              <td>${new Date(appointment.date).toLocaleDateString('pt-BR')}</td>
              <td>${appointment.time}</td>
              <td>${appointment.client}</td>
              <td>${appointment.phone}</td>
              <td>${appointment.service}</td>
              <td>${appointment.duration} min</td>
              <td>R$ ${appointment.price.toFixed(2)}</td>
              <td><span class="status ${appointment.status}">${statusMap[appointment.status]}</span></td>
              <td>${appointment.notes || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        <p>Barber.IA - Sistema de Gestão para Barbearias</p>
      </div>
    </body>
    </html>
  `;
};

// Função principal de exportação
export const exportAppointments = async (
  appointments: AppointmentExport[],
  options: ExportOptions
): Promise<void> => {
  try {
    const filteredAppointments = filterAppointments(appointments, options);
    
    if (filteredAppointments.length === 0) {
      Alert.alert('Aviso', 'Nenhum agendamento encontrado para o período selecionado.');
      return;
    }
    
    const fileName = `agendamentos_${options.startDate}_${options.endDate}`;
    let fileUri: string;
    let mimeType: string;
    
    switch (options.format) {
      case 'csv':
        const csvContent = generateCSV(filteredAppointments);
        fileUri = `${FileSystem.documentDirectory}${fileName}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        mimeType = 'text/csv';
        break;
        
      case 'excel':
        // Para Excel, vamos usar CSV com extensão .xls
        const excelContent = generateCSV(filteredAppointments);
        fileUri = `${FileSystem.documentDirectory}${fileName}.xls`;
        await FileSystem.writeAsStringAsync(fileUri, excelContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        mimeType = 'application/vnd.ms-excel';
        break;
        
      case 'pdf':
        // Para PDF, vamos criar um HTML e compartilhar
        const htmlContent = generateHTML(filteredAppointments, options);
        fileUri = `${FileSystem.documentDirectory}${fileName}.html`;
        await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        mimeType = 'text/html';
        break;
        
      default:
        throw new Error('Formato não suportado');
    }
    
    // Verificar se o arquivo foi criado
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error('Erro ao criar arquivo');
    }
    
    // Compartilhar o arquivo
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: `Compartilhar relatório de agendamentos (${options.format.toUpperCase()})`,
        UTI: mimeType,
      });
    } else {
      Alert.alert(
        'Sucesso',
        `Arquivo exportado com sucesso!\nLocal: ${fileUri}`,
        [{ text: 'OK' }]
      );
    }
    
    // Limpar arquivo temporário após um tempo
    setTimeout(async () => {
      try {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      } catch (error) {
        console.log('Erro ao limpar arquivo temporário:', error);
      }
    }, 300000); // 5 minutos
    
  } catch (error) {
    console.error('Erro na exportação:', error);
    Alert.alert(
      'Erro',
      'Erro ao exportar agendamentos. Tente novamente.',
      [{ text: 'OK' }]
    );
  }
};

// Função para gerar opções de período pré-definidas
export const getPredefinedPeriods = () => {
  const today = new Date();
  const thisWeekStart = new Date(today);
  const thisWeekEnd = new Date(today);
  
  // Início da semana (segunda-feira)
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  thisWeekStart.setDate(today.getDate() + mondayOffset);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
  
  // Mês atual
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Últimos 30 dias
  const last30DaysStart = new Date(today);
  last30DaysStart.setDate(today.getDate() - 30);
  
  // Próximos 30 dias
  const next30DaysEnd = new Date(today);
  next30DaysEnd.setDate(today.getDate() + 30);
  
  return {
    today: {
      label: 'Hoje',
      startDate: today.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    thisWeek: {
      label: 'Esta Semana',
      startDate: thisWeekStart.toISOString().split('T')[0],
      endDate: thisWeekEnd.toISOString().split('T')[0],
    },
    thisMonth: {
      label: 'Este Mês',
      startDate: thisMonthStart.toISOString().split('T')[0],
      endDate: thisMonthEnd.toISOString().split('T')[0],
    },
    last30Days: {
      label: 'Últimos 30 Dias',
      startDate: last30DaysStart.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    },
    next30Days: {
      label: 'Próximos 30 Dias',
      startDate: today.toISOString().split('T')[0],
      endDate: next30DaysEnd.toISOString().split('T')[0],
    },
  };
};
