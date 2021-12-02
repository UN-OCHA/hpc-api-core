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
import categoryRef from './models/categoryRef';
import client from './models/client';
import conditionField from './models/conditionField';
import conditionFieldReliesOn from './models/conditionFieldReliesOn';
import conditionFieldType from './models/conditionFieldType';
import currency from './models/currency';
import disaggregationCategory from './models/disaggregationCategory';
import disaggregationCategoryGroup from './models/disaggregationCategoryGroup';
import disaggregationModel from './models/disaggregationModel';
import emergency from './models/emergency';
import emergencyLocation from './models/emergencyLocation';
import endpointLog from './models/endpointLog';
import endpointUsage from './models/endpointUsage';
import entitiesAssociation from './models/entitiesAssociation';
import entityPrototype from './models/entityPrototype';
import expiredData from './models/expiredData';
import externalData from './models/externalData';
import externalReference from './models/externalReference';
import fileAssetEntity from './models/fileAssetEntity';
import fileRecord from './models/fileRecord';
import flow from './models/flow';
import flowLink from './models/flowLink';
import flowObject from './models/flowObject';
import flowObjectType from './models/flowObjectType';
import form from './models/form';
import globalCluster from './models/globalCluster';
import globalClusterAssociation from './models/globalClusterAssociation';
import globalIndicator from './models/globalIndicator';
import governingEntity from './models/governingEntity';
import governingEntityVersion from './models/governingEntityVersion';
import iatiActivity from './models/iatiActivity';
import iatiPublisher from './models/iatiPublisher';
import iatiRecipientCountry from './models/iatiRecipientCountry';
import iatiTransaction from './models/iatiTransaction';
import job from './models/job';
import jobAssociation from './models/jobAssociation';
import location from './models/location';
import measurement from './models/measurement';
import measurementVersion from './models/measurementVersion';
import operation from './models/operation';
import operationCluster from './models/operationCluster';
import organization from './models/organization';
import organizationLocation from './models/organizationLocation';
import participant from './models/participant';
import participantCountry from './models/participantCountry';
import participantOrganization from './models/participantOrganization';
import plan from './models/plan';
import planEmergency from './models/planEmergency';
import planEntity from './models/planEntity';
import planEntityVersion from './models/planEntityVersion';
import planLocation from './models/planLocation';
import planReportingPeriod from './models/planReportingPeriod';
import planTag from './models/planTag';
import planVersion from './models/planVersion';
import planYear from './models/planYear';
import procedureEntityPrototype from './models/procedureEntityPrototype';
import procedureSection from './models/procedureSection';
import procedureSectionField from './models/procedureSectionField';
import project from './models/project';
import projectContact from './models/projectContact';
import projectGlobalClusters from './models/projectGlobalClusters';
import projectLocations from './models/projectLocations';
import projectVersion from './models/projectVersion';
import projectVersionAttachment from './models/projectVersionAttachment';
import projectVersionComment from './models/projectVersionComment';
import projectVersionField from './models/projectVersionField';
import projectVersionGoverningEntity from './models/projectVersionGoverningEntity';
import projectVersionHistory from './models/projectVersionHistory';
import projectVersionOrganization from './models/projectVersionOrganization';
import projectVersionPlan from './models/projectVersionPlan';
import projectVersionPlanEntity from './models/projectVersionPlanEntity';
import reportingWindow from './models/reportingWindow';
import reportingWindowAssignment from './models/reportingWindowAssignment';
import tag from './models/tag';
import task from './models/task';
import unit from './models/unit';
import unitType from './models/unitType';
import usageYear from './models/usageYear';
import workflowStatusOption from './models/workflowStatusOption';
import workflowStatusOptionStep from './models/workflowStatusOptionStep';
import { Op, Cond } from './util/conditions';

/**
 * Utilities that are frequently used, and should also be included as part of
 * the model root for easy access.
 */
export const UTILS = {
  Op,
  Cond,
};

export default (conn: Knex) => ({
  ...UTILS,
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
  categoryRef: categoryRef(conn),
  client: client(conn),
  conditionField: conditionField(conn),
  conditionFieldReliesOn: conditionFieldReliesOn(conn),
  conditionFieldType: conditionFieldType(conn),
  currency: currency(conn),
  disaggregationCategory: disaggregationCategory(conn),
  disaggregationCategoryGroup: disaggregationCategoryGroup(conn),
  disaggregationModel: disaggregationModel(conn),
  emergency: emergency(conn),
  emergencyLocation: emergencyLocation(conn),
  endpointLog: endpointLog(conn),
  endpointUsage: endpointUsage(conn),
  entitiesAssociation: entitiesAssociation(conn),
  entityPrototype: entityPrototype(conn),
  expiredData: expiredData(conn),
  externalData: externalData(conn),
  externalReference: externalReference(conn),
  fileAssetEntity: fileAssetEntity(conn),
  fileRecord: fileRecord(conn),
  flow: flow(conn),
  flowLink: flowLink(conn),
  flowObject: flowObject(conn),
  flowObjectType: flowObjectType(conn),
  form: form(conn),
  globalCluster: globalCluster(conn),
  globalClusterAssociation: globalClusterAssociation(conn),
  globalIndicator: globalIndicator(conn),
  governingEntity: governingEntity(conn),
  governingEntityVersion: governingEntityVersion(conn),
  iatiActivity: iatiActivity(conn),
  iatiPublisher: iatiPublisher(conn),
  iatiRecipientCountry: iatiRecipientCountry(conn),
  iatiTransaction: iatiTransaction(conn),
  job: job(conn),
  jobAssociation: jobAssociation(conn),
  location: location(conn),
  measurement: measurement(conn),
  measurementVersion: measurementVersion(conn),
  operation: operation(conn),
  operationCluster: operationCluster(conn),
  organization: organization(conn),
  organizationLocation: organizationLocation(conn),
  participant: participant(conn),
  participantCountry: participantCountry(conn),
  participantOrganization: participantOrganization(conn),
  plan: plan(conn),
  planEmergency: planEmergency(conn),
  planEntity: planEntity(conn),
  planEntityVersion: planEntityVersion(conn),
  planLocation: planLocation(conn),
  planReportingPeriod: planReportingPeriod(conn),
  planTag: planTag(conn),
  planVersion: planVersion(conn),
  planYear: planYear(conn),
  procedureEntityPrototype: procedureEntityPrototype(conn),
  procedureSection: procedureSection(conn),
  procedureSectionField: procedureSectionField(conn),
  project: project(conn),
  projectContact: projectContact(conn),
  projectGlobalClusters: projectGlobalClusters(conn),
  projectLocations: projectLocations(conn),
  projectVersion: projectVersion(conn),
  projectVersionAttachment: projectVersionAttachment(conn),
  projectVersionComment: projectVersionComment(conn),
  projectVersionField: projectVersionField(conn),
  projectVersionGoverningEntity: projectVersionGoverningEntity(conn),
  projectVersionHistory: projectVersionHistory(conn),
  projectVersionOrganization: projectVersionOrganization(conn),
  projectVersionPlan: projectVersionPlan(conn),
  projectVersionPlanEntity: projectVersionPlanEntity(conn),
  reportingWindow: reportingWindow(conn),
  reportingWindowAssignment: reportingWindowAssignment(conn),
  tag: tag(conn),
  task: task(conn),
  unit: unit(conn),
  unitType: unitType(conn),
  usageYear: usageYear(conn),
  workflowStatusOption: workflowStatusOption(conn),
  workflowStatusOptionStep: workflowStatusOptionStep(conn),
});
