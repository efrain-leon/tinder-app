import _ from 'underscore';

const checkSystemAccess = {};

checkSystemAccess.checkSystemAccessAndEmptyMail = (changes, userChanges, populatedUser) => {
  if (userChanges.email) {
    return;
  }

  const systemAccessProfiles = _.chain(populatedUser.profiles)
  .filter((profile) => {
    if (changes.systemAccess === true || changes.systemAccess === false) {
      return profile._id.toString() !== changes._id.toString();
    }

    return true;
  })
  .pluck('systemAccess')
  .some()
  .value();

  if ((systemAccessProfiles === true || changes.systemAccess === true) && populatedUser.activated) {
    throw [{ message: 'email_required_when_access', value: '' }];
  }
}

export default checkSystemAccess;