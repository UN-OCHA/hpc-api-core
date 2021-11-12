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
import blueprint from './models/blueprint';
import budgetSegment from './models/budgetSegment';
import budgetSegmentBreakdown from './models/budgetSegmentBreakdown';
import budgetSegmentBreakdownEntity from './models/budgetSegmentBreakdownEntity';
import cache from './models/cache';
import category from './models/category';
import categoryGroup from './models/categoryGroup';
import conditionField from './models/conditionField';
import conditionFieldReliesOn from './models/conditionFieldReliesOn';
import conditionFieldType from './models/conditionFieldType';
import entitiesAssociation from './models/entitiesAssociation';
import entityPrototype from './models/entityPrototype';
import expiredData from './models/expiredData';
import form from './models/form';
import governingEntity from './models/governingEntity';
import governingEntityVersion from './models/governingEntityVersion';
import location from './models/location';
import operation from './models/operation';
import operationCluster from './models/operationCluster';
import organization from './models/organization';
import participant from './models/participant';
import plan from './models/plan';
import planEntity from './models/planEntity';
import planEntityVersion from './models/planEntityVersion';
import planVersion from './models/planVersion';
import planYear from './models/planYear';
import project from './models/project';
import projectContact from './models/projectContact';
import projectVersion from './models/projectVersion';
import projectVersionAttachment from './models/projectVersionAttachment';
import projectVersionField from './models/projectVersionField';
import projectVersionGoverningEntity from './models/projectVersionGoverningEntity';
import projectVersionHistory from './models/projectVersionHistory';
import projectVersionOrganization from './models/projectVersionOrganization';
import projectVersionPlan from './models/projectVersionPlan';
import reportingWindow from './models/reportingWindow';
import reportingWindowAssignment from './models/reportingWindowAssignment';
import usageYear from './models/usageYear';
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
  blueprint: blueprint(conn),
  budgetSegment: budgetSegment(conn),
  budgetSegmentBreakdown: budgetSegmentBreakdown(conn),
  budgetSegmentBreakdownEntity: budgetSegmentBreakdownEntity(conn),
  cache: cache(conn),
  category: category(conn),
  categoryGroup: categoryGroup(conn),
  conditionField: conditionField(conn),
  conditionFieldReliesOn: conditionFieldReliesOn(conn),
  conditionFieldType: conditionFieldType(conn),
  entitiesAssociation: entitiesAssociation(conn),
  entityPrototype: entityPrototype(conn),
  expiredData: expiredData(conn),
  form: form(conn),
  governingEntity: governingEntity(conn),
  governingEntityVersion: governingEntityVersion(conn),
  location: location(conn),
  operation: operation(conn),
  operationCluster: operationCluster(conn),
  organization: organization(conn),
  participant: participant(conn),
  plan: plan(conn),
  planEntity: planEntity(conn),
  planEntityVersion: planEntityVersion(conn),
  planVersion: planVersion(conn),
  planYear: planYear(conn),
  project: project(conn),
  projectContact: projectContact(conn),
  projectVersion: projectVersion(conn),
  projectVersionAttachment: projectVersionAttachment(conn),
  projectVersionField: projectVersionField(conn),
  projectVersionGoverningEntity: projectVersionGoverningEntity(conn),
  projectVersionHistory: projectVersionHistory(conn),
  projectVersionOrganization: projectVersionOrganization(conn),
  projectVersionPlan: projectVersionPlan(conn),
  reportingWindow: reportingWindow(conn),
  reportingWindowAssignment: reportingWindowAssignment(conn),
  usageYear: usageYear(conn),
  workflowStatusOption: workflowStatusOption(conn),
});
