export type MailForm =
  {
    from: string,
    to: string,
    subject: string,
    text: string,
    attachments: {
      path: string
    }[]
  }