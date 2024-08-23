import type { Knex } from 'knex';
import attachment from './models/attachment';
import attachmentPrototype from './models/attachmentPrototype';
import attachmentVersion from './models/attachmentVersion';
import authGrant from './models/authGrant';
import authGrantLog from './models/authGrantLog';
import authGrantee from './models/authGrantee';
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
import highWater from './models/highWater';
import iatiActivity from './models/iatiActivity';
import iatiPublisher from './models/iatiPublisher';
import iatiRecipientCountry from './models/iatiRecipientCountry';
import iatiTransaction from './models/iatiTransaction';
import job from './models/job';
import jobAssociation from './models/jobAssociation';
import legacy from './models/legacy';
import location from './models/location';
import lookup from './models/lookup';
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
import reportDetail from './models/reportDetail';
import reportFile from './models/reportFile';
import reportingWindow from './models/reportingWindow';
import reportingWindowAssignment from './models/reportingWindowAssignment';
import tag from './models/tag';
import task from './models/task';
import unit from './models/unit';
import unitType from './models/unitType';
import usageYear from './models/usageYear';
import workflowStatusOption from './models/workflowStatusOption';
import workflowStatusOptionStep from './models/workflowStatusOptionStep';
import { Cond, Op } from './util/conditions';

/**
 * Utilities that are frequently used, and should also be included as part of
 * the model root for easy access.
 */
export const UTILS = {
  Op,
  Cond,
};

const initializeTables = (masterConn: Knex, replicaConn?: Knex) => ({
  attachment: attachment(masterConn, replicaConn),
  attachmentPrototype: attachmentPrototype(masterConn, replicaConn),
  attachmentVersion: attachmentVersion(masterConn, replicaConn),
  authGrant: authGrant(masterConn, replicaConn),
  authGrantee: authGrantee(masterConn, replicaConn),
  authGrantLog: authGrantLog(masterConn, replicaConn),
  authInvite: authInvite(masterConn, replicaConn),
  authTarget: authTarget(masterConn, replicaConn),
  authToken: authToken(masterConn, replicaConn),
  blueprint: blueprint(masterConn, replicaConn),
  budgetSegment: budgetSegment(masterConn, replicaConn),
  budgetSegmentBreakdown: budgetSegmentBreakdown(masterConn, replicaConn),
  budgetSegmentBreakdownEntity: budgetSegmentBreakdownEntity(
    masterConn,
    replicaConn
  ),
  cache: cache(masterConn, replicaConn),
  category: category(masterConn, replicaConn),
  categoryGroup: categoryGroup(masterConn, replicaConn),
  categoryRef: categoryRef(masterConn, replicaConn),
  client: client(masterConn, replicaConn),
  conditionField: conditionField(masterConn, replicaConn),
  conditionFieldReliesOn: conditionFieldReliesOn(masterConn, replicaConn),
  conditionFieldType: conditionFieldType(masterConn, replicaConn),
  currency: currency(masterConn, replicaConn),
  disaggregationCategory: disaggregationCategory(masterConn, replicaConn),
  disaggregationCategoryGroup: disaggregationCategoryGroup(
    masterConn,
    replicaConn
  ),
  disaggregationModel: disaggregationModel(masterConn, replicaConn),
  emergency: emergency(masterConn, replicaConn),
  emergencyLocation: emergencyLocation(masterConn, replicaConn),
  endpointLog: endpointLog(masterConn, replicaConn),
  endpointUsage: endpointUsage(masterConn, replicaConn),
  entityPrototype: entityPrototype(masterConn, replicaConn),
  expiredData: expiredData(masterConn, replicaConn),
  externalData: externalData(masterConn, replicaConn),
  externalReference: externalReference(masterConn, replicaConn),
  fileAssetEntity: fileAssetEntity(masterConn, replicaConn),
  fileRecord: fileRecord(masterConn, replicaConn),
  flow: flow(masterConn, replicaConn),
  flowLink: flowLink(masterConn, replicaConn),
  flowObject: flowObject(masterConn, replicaConn),
  flowObjectType: flowObjectType(masterConn, replicaConn),
  form: form(masterConn, replicaConn),
  globalCluster: globalCluster(masterConn, replicaConn),
  globalClusterAssociation: globalClusterAssociation(masterConn, replicaConn),
  globalIndicator: globalIndicator(masterConn, replicaConn),
  governingEntity: governingEntity(masterConn, replicaConn),
  governingEntityVersion: governingEntityVersion(masterConn, replicaConn),
  highWater: highWater(masterConn, replicaConn),
  iatiActivity: iatiActivity(masterConn, replicaConn),
  iatiPublisher: iatiPublisher(masterConn, replicaConn),
  iatiRecipientCountry: iatiRecipientCountry(masterConn, replicaConn),
  iatiTransaction: iatiTransaction(masterConn, replicaConn),
  job: job(masterConn, replicaConn),
  jobAssociation: jobAssociation(masterConn, replicaConn),
  legacy: legacy(masterConn, replicaConn),
  location: location(masterConn, replicaConn),
  lookup: lookup(masterConn, replicaConn),
  measurement: measurement(masterConn, replicaConn),
  measurementVersion: measurementVersion(masterConn, replicaConn),
  operation: operation(masterConn, replicaConn),
  operationCluster: operationCluster(masterConn, replicaConn),
  organization: organization(masterConn, replicaConn),
  organizationLocation: organizationLocation(masterConn, replicaConn),
  participant: participant(masterConn, replicaConn),
  participantCountry: participantCountry(masterConn, replicaConn),
  participantOrganization: participantOrganization(masterConn, replicaConn),
  plan: plan(masterConn, replicaConn),
  planEmergency: planEmergency(masterConn, replicaConn),
  planEntity: planEntity(masterConn, replicaConn),
  planEntityVersion: planEntityVersion(masterConn, replicaConn),
  planLocation: planLocation(masterConn, replicaConn),
  planReportingPeriod: planReportingPeriod(masterConn, replicaConn),
  planTag: planTag(masterConn, replicaConn),
  planVersion: planVersion(masterConn, replicaConn),
  planYear: planYear(masterConn, replicaConn),
  procedureEntityPrototype: procedureEntityPrototype(masterConn, replicaConn),
  procedureSection: procedureSection(masterConn, replicaConn),
  procedureSectionField: procedureSectionField(masterConn, replicaConn),
  project: project(masterConn, replicaConn),
  projectContact: projectContact(masterConn, replicaConn),
  projectGlobalClusters: projectGlobalClusters(masterConn, replicaConn),
  projectLocations: projectLocations(masterConn, replicaConn),
  projectVersion: projectVersion(masterConn, replicaConn),
  projectVersionAttachment: projectVersionAttachment(masterConn, replicaConn),
  projectVersionComment: projectVersionComment(masterConn, replicaConn),
  projectVersionField: projectVersionField(masterConn, replicaConn),
  projectVersionGoverningEntity: projectVersionGoverningEntity(
    masterConn,
    replicaConn
  ),
  projectVersionHistory: projectVersionHistory(masterConn, replicaConn),
  projectVersionOrganization: projectVersionOrganization(
    masterConn,
    replicaConn
  ),
  projectVersionPlan: projectVersionPlan(masterConn, replicaConn),
  projectVersionPlanEntity: projectVersionPlanEntity(masterConn, replicaConn),
  reportDetail: reportDetail(masterConn, replicaConn),
  reportFile: reportFile(masterConn, replicaConn),
  reportingWindow: reportingWindow(masterConn, replicaConn),
  reportingWindowAssignment: reportingWindowAssignment(masterConn, replicaConn),
  tag: tag(masterConn, replicaConn),
  task: task(masterConn, replicaConn),
  unit: unit(masterConn, replicaConn),
  unitType: unitType(masterConn, replicaConn),
  usageYear: usageYear(masterConn, replicaConn),
  workflowStatusOption: workflowStatusOption(masterConn, replicaConn),
  workflowStatusOptionStep: workflowStatusOptionStep(masterConn, replicaConn),
});

export type Tables = ReturnType<typeof initializeTables>;

export type Table = Tables[keyof Tables];

const initializeRoot = (masterConn: Knex, replicaConn?: Knex) => {
  const _tables = initializeTables(masterConn, replicaConn);
  return {
    ...UTILS,
    ..._tables,
    /**
     * Expose the tables grouped together under one object under the root to
     * allow for easier iteration through each of them.
     *
     * (this is used in unit tests)
     */
    _tables,
  };
};

export type Database = ReturnType<typeof initializeRoot>;

export default initializeRoot;
