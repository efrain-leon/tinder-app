var subject = 'Mi taller cambio de email';
var title = 'Tu correo ha sido actualizado con éxito.';
var header = 'Tu correo ha sido cambiado para ingresar a Mi Taller. Tu nueva cuenta de ingreso es:';
var text = 'Si fuiste tú puedes ignorar este mensaje. Si no fuiste tú, protege tu cuenta y comunicate con el administrador del sistema, puesto que alguien más puede estar accediendo a tu cuenta.';

export default (usersModel, mailer) => {

  async function sendActivationMail(userMail, userOldMail) {
    try {
      const mail = {
        to: [userMail, userOldMail],
        subject: subject,
        title_text: title,
        header_text: header,
        link: userMail,
        footer_text: '',
        end_text: text
      };

      const responseSendEmail =  mailer.send(mail);
      return responseSendEmail;
    }
    catch (err) {
      throw err;
    }
  }

  return {
    alertChangeMail: async (userProfile, userOldMail) => {
      try {
        const user =  usersModel.find({ _id: userProfile.user });
        await sendActivationMail(user[0].email, userOldMail);
        return userProfile;
      }
      catch (err) {
        throw err;
      }
    }
  };
};
