import Knex = require('knex');
import attachment from './models/attachment';
import attachmentVersion from './models/attachmentVersion';
import authGrant from './models/authGrant';
import authGrantee from './models/authGrantee';
import authGrantLog from './models/authGrantLog';
import authInvite from './models/authInvite';
import authTarget from './models/authTarget';
import authToken from './models/authToken';
import form from './models/form';
import governingEntity from './models/governingEntity';
import operation from './models/operation';
import operationCluster from './models/operationCluster';
import participant from './models/participant';
import projectVersion from './models/projectVersion';
import projectVersionPlan from './models/projectVersionPlan';
import reportingWindow from './models/reportingWindow';
import reportingWindowAssignment from './models/reportingWindowAssignment';

export default (conn: Knex) => ({
  attachment: attachment(conn),
  attachmentVersion: attachmentVersion(conn),
  authGrant: authGrant(conn),
  authGrantee: authGrantee(conn),
  authGrantLog: authGrantLog(conn),
  authInvite: authInvite(conn),
  authTarget: authTarget(conn),
  authToken: authToken(conn),
  form: form(conn),
  governingEntity: governingEntity(conn),
  operation: operation(conn),
  operationCluster: operationCluster(conn),
  participant: participant(conn),
  projectVersion: projectVersion(conn),
  projectVersionPlan: projectVersionPlan(conn),
  reportingWindow: reportingWindow(conn),
  reportingWindowAssignment: reportingWindowAssignment(conn),
});
