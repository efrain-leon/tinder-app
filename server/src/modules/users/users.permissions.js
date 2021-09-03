import permissionsUtils from '../../utils/permissions.utils';

module.exports = {
  general: {
    users_can_find: permissionsUtils.generatePermissions('find', [ 'all' ]),
    users_can_create: permissionsUtils.generatePermissions([ 'create', 'find' ], [ 'all' ]),
    users_can_update: permissionsUtils.generatePermissions([ 'update', 'find' ], [ 'all' ]),
    users_can_remove: permissionsUtils.generatePermissions([ 'remove', 'find' ], [ 'all' ])
  }
};