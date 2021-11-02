import Knex = require('knex');
import attachment from './models/attachment';
import attachmentPrototype from './models/attachmentPrototype';
import attachmentVersion from './models/attachmentVersion';
import authGrant from './models/authGrant';
import authGrantee from './models/authGrantee';
import authGrantLog from './models/authGrantLog';
import authInvite from './models/authInvite';
import authTarget from './models/authTarget';
import authToken from './models/authToken';
import entitiesAssociation from './models/entitiesAssociation';
import entityPrototype from './models/entityPrototype';
import expiredData from './models/expiredData';
import form from './models/form';
import governingEntity from './models/governingEntity';
import governingEntityVersion from './models/governingEntityVersion';
import location from './models/location';
import operation from './models/operation';
import operationCluster from './models/operationCluster';
import participant from './models/participant';
import plan from './models/plan';
import planEntity from './models/planEntity';
import planEntityVersion from './models/planEntityVersion';
import planVersion from './models/planVersion';
import project from './models/project';
import projectVersion from './models/projectVersion';
import projectVersionAttachment from './models/projectVersionAttachment';
import projectVersionPlan from './models/projectVersionPlan';
import reportingWindow from './models/reportingWindow';
import reportingWindowAssignment from './models/reportingWindowAssignment';
import workflowStatusOption from './models/workflowStatusOption';

export default (conn: Knex) => ({
  attachment: attachment(conn),
  attachmentPrototype: attachmentPrototype(conn),
  attachmentVersion: attachmentVersion(conn),
  authGrant: authGrant(conn),
  authGrantee: authGrantee(conn),
  authGrantLog: authGrantLog(conn),
  authInvite: authInvite(conn),
  authTarget: authTarget(conn),
  authToken: authToken(conn),
  entitiesAssociation: entitiesAssociation(conn),
  entityPrototype: entityPrototype(conn),
  expiredData: expiredData(conn),
  form: form(conn),
  governingEntity: governingEntity(conn),
  governingEntityVersion: governingEntityVersion(conn),
  location: location(conn),
  operation: operation(conn),
  operationCluster: operationCluster(conn),
  participant: participant(conn),
  plan: plan(conn),
  planEntity: planEntity(conn),
  planEntityVersion: planEntityVersion(conn),
  planVersion: planVersion(conn),
  project: project(conn),
  projectVersion: projectVersion(conn),
  projectVersionAttachment: projectVersionAttachment(conn),
  projectVersionPlan: projectVersionPlan(conn),
  reportingWindow: reportingWindow(conn),
  reportingWindowAssignment: reportingWindowAssignment(conn),
  workflowStatusOption: workflowStatusOption(conn),
});
