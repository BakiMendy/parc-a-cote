// Fonction pour envoyer un email (à implémenter avec un service d'envoi d'emails)
export async function sendEmail(to: string, subject: string, content: string) {
  // TODO: Implémenter avec un service d'envoi d'emails (SendGrid, Amazon SES, etc.)
  console.log('Envoi d\'email:', { to, subject, content });
}

export const emailTemplates = {
  playgroundApproved: (playgroundName: string) => ({
    subject: `Votre parc "${playgroundName}" a été approuvé !`,
    content: `
      Bonjour,
      
      Nous sommes heureux de vous informer que votre parc "${playgroundName}" a été approuvé par notre équipe.
      Il est maintenant visible sur la carte et dans la liste des parcs.
      
      Merci de votre contribution !
      
      L'équipe Parc à côté
    `
  }),
  
  playgroundRejected: (playgroundName: string, reason?: string) => ({
    subject: `Information concernant votre parc "${playgroundName}"`,
    content: `
      Bonjour,
      
      Nous avons examiné votre soumission pour le parc "${playgroundName}".
      Malheureusement, nous ne pouvons pas l'approuver pour le moment.
      
      ${reason ? `Raison : ${reason}` : ''}
      
      N'hésitez pas à soumettre à nouveau votre parc en tenant compte de nos remarques.
      
      L'équipe Parc à côté
    `
  })
};