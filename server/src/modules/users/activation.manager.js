import { serverConfig } from '../../config/server';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'md5';
import _ from 'underscore';

let activationMailSubject = 'Por favor, activa tu cuenta en TALENTHUS';
let activactionTitle = 'Bienvenido a la comunidad TALENTHUS! Ahora ya puedes acceder a la aplicación.';
let activationMailHeader = 'Por favor, para activar su cuenta has click en el siguiente enlace:';
let activationMailLink = '%DOMAIN%/activate/%token%';
let activationMailLinkText = 'Activar cuenta!';
let activationMailFooter = 'Una vez realizada la activación de tu cuenta, podrás ingresar a TALENTHUS entrando a la dirección www.talenthus.net utilizando tu cuenta de correo electrónico y la clave que hayas asignado durante el proceso de activación.';
let activationEndText = 'Si su navegador no lo redirige automáticamente, por favor copie y pegue el link en la barra de dirección web';

let passwordResetMailSubject = 'Por favor, cambia tu contraseña en TALENTHUS';
let passwordResetTitle = 'Cambio de contraseña.';
let passwordResetMailHeader = 'Por favor, para cambiar la contraseña de tu cuenta has click en el siguiente enlace:';
let passwordResetMailLink = '%DOMAIN%/activate/%token%?activate=true';
let passwordResetMailLinkText = 'Recuperar contraseña!';
let passwordResetMailFooter = 'Una vez realizado el cambio de contraseña, podrás ingresar a TALENTHUS entrando a la dirección www.talenthus.net utilizando tu cuenta de correo electrónico y la clave que hayas asignado.';
let passwordResetEndText = 'Si su navegador no lo redirige automáticamente, por favor copie y pegue el link en la barra de dirección web';

export default (usersModel, pendingActivationModel, mailer) => {

  async function activateAccount(token, password) {
    try {
      const activation = await pendingActivationModel.find({token: token});

      if (_.isEmpty(activation)) {
        throw { message: 'Invalid token', value: token };
      }

      await pendingActivationModel.remove({_id: activation[0]._id});
      const user = await usersModel.find({email: activation[0].email});

      if (_.isEmpty(user)) {
        throw { message: 'User not found', value:  activation[0].email};
      }

      user[0].activated = true;
      user[0].setPassword(password);
      const updatedUser = await usersModel.update(user[0]);

      return updatedUser;
    }
    catch (err) {
      throw err;
    }
  }

  async function validateToken(token) {
    try {
      const pendingActivation = await pendingActivationModel.find({token: token});
      return pendingActivation.length > 0;
    }
    catch (err) {
      throw { message: 'Invalid token', value: token };
    }
  }

  function validateActivation(activations, token) {
    if (activations.length === 0) {
      throw { message: 'no_such_token', value: token };
    }
  }

  async function storePendingActivation(user) {
    try {
      if (!user.email) {
        throw {message: 'email_required_when_access', value: ''};
      }

      const token = generateToken(user.email);

      const pendingActivationCreated = pendingActivationModel.create({email: user.email, token: token});

      return pendingActivationCreated;
    }
    catch (err) {
      throw err;
    }
  }

  async function sendActivationMail(pendingActivation) {
    try {
      let mail = {
        to: pendingActivation.email,
        subject: activationMailSubject,
        titleText: activactionTitle,
        headerText: activationMailHeader,
        link: activationMailLink.replace('%token%', pendingActivation.token).replace('%DOMAIN%', serverConfig.DOMAIN),
        linkText: activationMailLinkText,
        footerText: activationMailFooter,
        endText: activationEndText
      };

      const emailSent = await mailer.send(mail);
      return emailSent;
    }
    catch (err) {
      throw err;
    }
  }

  async function sendPasswordResetMail(pendingActivation) {
    try {
      let mail = {
        to: pendingActivation.email,
        subject: passwordResetMailSubject,
        titleText: passwordResetTitle,
        headerText: passwordResetMailHeader,
        link: passwordResetMailLink.replace('%token%', pendingActivation.token).replace('%DOMAIN%', serverConfig.DOMAIN),
        linkText: passwordResetMailLinkText,
        footerText: passwordResetMailFooter,
        endText: passwordResetEndText
      };

      const emailSent = await mailer.send(mail);
      return emailSent;
    }
    catch (err) {
      throw err;
    }
  }

  async function resendActivationEmail(email) {
    try {
      const users = await usersModel.find({ email: email });

      if (users.length === 0) {
        throw { message: 'cannot_resend_email_no_such_user', value: email };
      }

      let pendingActivations = await pendingActivationModel.find({ email: email });

      const token = generateToken(email);

      if (pendingActivations.length !== 0) {
        pendingActivations = await pendingActivationModel.update({ _id: pendingActivations[0]._id, token: token});
      }
      else {
        pendingActivations = await pendingActivationModel.create({ email: email, token: token });
      }

      sendPasswordResetMail(pendingActivations);
    }
    catch (err) {
      throw err;
    }
  }

  function generateToken(email) {
    if (!email) {
      return '';
    }
    const emailMd5  = md5(email);
    return uuidv4() + emailMd5;
  }

  return {
    activateAccount: activateAccount,
    validateToken: validateToken,
    resendActivationEmail: resendActivationEmail,
    startActivation: async (user) => {
      try {
        const pendingActivation = await storePendingActivation(user);
        await sendActivationMail(pendingActivation);
        return user;
      }
      catch (err) {
        throw err;
      }
    }
  };
};