const AccessControl = require("accesscontrol");
const ac = new AccessControl();

ac.grant("basic").readOwn("profile").updateOwn("profile");
//supervisor
ac.grant("supervisor").extend("basic").readAny("profile");
//admin
ac.grant("admin")
  .extend("supervisor")
  .updateAny("profile")
  .deleteAny("profile");

exports.ac = ac;
