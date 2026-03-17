/**
 * Email notification helper
 * Sends email notifications for order status changes and PDF attachments
 */

export async function sendEmailNotification(
  to: string,
  subject: string,
  message: string
): Promise<boolean> {
  try {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, we'll log the notification
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}, Message: ${message}`);
    
    // TODO: Integrate with actual email service
    // Example with SendGrid or similar service:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: process.env.FROM_EMAIL || 'noreply@ordem-sistema.com' },
    //     subject,
    //     content: [{ type: 'text/html', value: message }],
    //   }),
    // });
    // return response.ok;
    
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send notification:', error);
    return false;
  }
}

export function getStatusChangeMessage(
  userName: string,
  orderType: string,
  orderTitle: string,
  newStatus: string
): string {
  const statusLabels: Record<string, string> = {
    not_started: 'Não Iniciada',
    in_process: 'Em Processo',
    completed: 'Concluída',
  };

  return `
    <h2>Atualização de Ordem</h2>
    <p>Olá ${userName},</p>
    <p>Sua solicitação de <strong>${orderType}</strong> foi atualizada:</p>
    <p><strong>Título:</strong> ${orderTitle}</p>
    <p><strong>Novo Status:</strong> ${statusLabels[newStatus] || newStatus}</p>
    <p>Acesse o sistema para mais detalhes.</p>
  `;
}

export function getPdfAttachedMessage(
  userName: string,
  orderType: string,
  orderTitle: string
): string {
  return `
    <h2>PDF Disponível</h2>
    <p>Olá ${userName},</p>
    <p>O PDF da sua <strong>${orderType}</strong> está pronto para download:</p>
    <p><strong>Título:</strong> ${orderTitle}</p>
    <p>Acesse o sistema para baixar o documento.</p>
  `;
}
