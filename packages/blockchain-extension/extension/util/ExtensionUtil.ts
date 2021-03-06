/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
'use strict';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as semver from 'semver';
import { ExtensionCommands } from '../../ExtensionCommands';
import { SettingConfigurations } from '../configurations';
import { addGateway } from '../commands/addGatewayCommand';
import { addWallet } from '../commands/addWalletCommand';
import { addWalletIdentity } from '../commands/addWalletIdentityCommand';
import { associateWallet } from '../commands/associateWalletCommand';
import { createNewIdentity } from '../commands/createNewIdentityCommand';
import { createSmartContractProject } from '../commands/createSmartContractProjectCommand';
import { debugCommandList } from '../commands/debugCommandListCommand';
import { deleteGateway } from '../commands/deleteGatewayCommand';
import { deleteIdentity } from '../commands/deleteIdentityCommand';
import { deleteSmartContractPackage } from '../commands/deleteSmartContractPackageCommand';
import { dissociateWallet } from '../commands/dissociateWalletCommand';
import { exportConnectionProfile } from '../commands/exportConnectionProfileCommand';
import { exportSmartContractPackage } from '../commands/exportSmartContractPackageCommand';
import { exportWallet } from '../commands/exportWalletCommand';
import { importSmartContractPackageCommand } from '../commands/importSmartContractPackageCommand';
import { installSmartContract } from '../commands/installCommand';
import { instantiateSmartContract } from '../commands/instantiateCommand';
import { packageSmartContract } from '../commands/packageSmartContractCommand';
import { removeWallet } from '../commands/removeWalletCommand';
import { restartFabricRuntime } from '../commands/restartFabricRuntime';
import { startFabricRuntime } from '../commands/startFabricRuntime';
import { stopFabricRuntime } from '../commands/stopFabricRuntime';
import { submitTransaction } from '../commands/submitTransaction';
import { teardownFabricRuntime } from '../commands/teardownFabricRuntime';
import { testSmartContract } from '../commands/testSmartContractCommand';
import { upgradeSmartContract } from '../commands/upgradeCommand';
import { FabricGoDebugConfigurationProvider } from '../debug/FabricGoDebugConfigurationProvider';
import { FabricJavaDebugConfigurationProvider } from '../debug/FabricJavaDebugConfigurationProvider';
import { FabricNodeDebugConfigurationProvider } from '../debug/FabricNodeDebugConfigurationProvider';
import { BlockchainGatewayExplorerProvider } from '../explorer/gatewayExplorer';
import { BlockchainTreeItem } from '../explorer/model/BlockchainTreeItem';
import { ContractTreeItem } from '../explorer/model/ContractTreeItem';
import { GatewayAssociatedTreeItem } from '../explorer/model/GatewayAssociatedTreeItem';
import { GatewayDissociatedTreeItem } from '../explorer/model/GatewayDissociatedTreeItem';
import { GatewayTreeItem } from '../explorer/model/GatewayTreeItem';
import { IdentityTreeItem } from '../explorer/model/IdentityTreeItem';
import { InstantiatedContractTreeItem } from '../explorer/model/InstantiatedContractTreeItem';
import { InstantiatedTreeItem } from '../explorer/model/InstantiatedTreeItem';
import { PackageTreeItem } from '../explorer/model/PackageTreeItem';
import { TransactionTreeItem } from '../explorer/model/TransactionTreeItem';
import { BlockchainPackageExplorerProvider } from '../explorer/packageExplorer';
import { CertificateAuthorityTreeItem } from '../explorer/runtimeOps/connectedTree/CertificateAuthorityTreeItem';
import { NodeTreeItem } from '../explorer/runtimeOps/connectedTree/NodeTreeItem';
import { BlockchainWalletExplorerProvider } from '../explorer/walletExplorer';
import { WalletTreeItem } from '../explorer/wallets/WalletTreeItem';
import { FabricGatewayConnectionManager } from '../fabric/FabricGatewayConnectionManager';
import { VSCodeBlockchainOutputAdapter } from '../logging/VSCodeBlockchainOutputAdapter';
import { PackageRegistryEntry } from '../registries/PackageRegistryEntry';
import { HomeView } from '../webview/HomeView';
import { SampleView } from '../webview/SampleView';
import { TutorialGalleryView } from '../webview/TutorialGalleryView';
import { TutorialView } from '../webview/TutorialView';
import { Fabric2View } from '../webview/Fabric2View';
import { Reporter } from './Reporter';
import { PreReqView } from '../webview/PreReqView';
import { BlockchainEnvironmentExplorerProvider } from '../explorer/environmentExplorer';
import { gatewayConnect } from '../commands/gatewayConnectCommand';
import { addEnvironment } from '../commands/addEnvironmentCommand';
import { FabricEnvironmentTreeItem } from '../explorer/runtimeOps/disconnectedTree/FabricEnvironmentTreeItem';
import { deleteEnvironment } from '../commands/deleteEnvironmentCommand';
import { associateIdentityWithNode } from '../commands/associateIdentityWithNode';
import { fabricEnvironmentConnect } from '../commands/environmentConnectCommand';
import { FabricEnvironmentManager } from '../fabric/environments/FabricEnvironmentManager';
import { DependencyManager } from '../dependencies/DependencyManager';
import { GlobalState, ExtensionData } from './GlobalState';
import { TemporaryCommandRegistry } from '../dependencies/TemporaryCommandRegistry';
import { version as currentExtensionVersion, dependencies } from '../../package.json';
import { UserInputUtil } from '../commands/UserInputUtil';
import { FabricSmartContractDefinition, FabricEnvironmentRegistry, FabricEnvironmentRegistryEntry, FabricNode, FabricRuntimeUtil, FabricWalletRegistry, FabricWalletRegistryEntry, FileRegistry, LogType, FabricGatewayRegistry, FabricGatewayRegistryEntry, EnvironmentType, EnvironmentFlags, FileSystemUtil, FileConfigurations } from 'ibm-blockchain-platform-common';
import { importNodesToEnvironment } from '../commands/importNodesToEnvironmentCommand';
import { deleteNode } from '../commands/deleteNodeCommand';
import { openTransactionView } from '../commands/openTransactionViewCommand';
import { RuntimeTreeItem } from '../explorer/runtimeOps/disconnectedTree/RuntimeTreeItem';
import { FabricConnectionFactory } from '../fabric/FabricConnectionFactory';
import { associateTransactionDataDirectory } from '../commands/associateTransactionDataDirectoryCommand';
import { dissociateTransactionDataDirectory } from '../commands/dissociateTransactionDataDirectoryCommand';
import { IAssociateFromViewOptions } from '../interfaces/IAssociateFromViewOptions';
import { openReleaseNotes } from '../commands/openReleaseNotesCommand';
import { viewPackageInformation } from '../commands/viewPackageInformationCommand';
import { VSCodeBlockchainDockerOutputAdapter } from '../logging/VSCodeBlockchainDockerOutputAdapter';
import { subscribeToEvent } from '../commands/subscribeToEventCommand';
import { approveSmartContract } from '../commands/approveCommand';
import { commitSmartContract } from '../commands/commitCommand';
import { deploySmartContract } from '../commands/deployCommand';
import { openDeployView } from '../commands/openDeployView';
import { exportAppData } from '../commands/exportAppData';
import { saveTutorial } from '../commands/saveTutorialCommand';
import { manageFeatureFlags } from '../commands/manageFeatureFlags';
import { logInAndDiscover } from '../commands/logInAndDiscoverCommand';
import Axios from 'axios';
import { URL } from 'url';
import { FeatureFlagManager } from './FeatureFlags';
import { openConsoleInBrowser } from '../commands/openConsoleInBrowserCommand';
import { deleteExtensionDirectory } from '../commands/deleteExtensionDirectoryCommand';
import { defaultDependencies, Dependencies } from '../dependencies/Dependencies';
import { LocalMicroEnvironmentManager } from '../fabric/environments/LocalMicroEnvironmentManager';
import { LocalMicroEnvironment } from '../fabric/environments/LocalMicroEnvironment';
import { SampleGalleryView } from '../webview/SampleGalleryView';
import { openCouchDbInBrowser} from '../commands/openCouchDbInBrowserCommand';

let blockchainGatewayExplorerProvider: BlockchainGatewayExplorerProvider;
let blockchainPackageExplorerProvider: BlockchainPackageExplorerProvider;
let blockchainEnvironmentExplorerProvider: BlockchainEnvironmentExplorerProvider;
let blockchainWalletExplorerProvider: BlockchainWalletExplorerProvider;

export const FABRIC_NETWORK_NODE_VERSION: string = '2.2.0';
export const FABRIC_NETWORK_JAVA_VERSION: string = '2.2.0';
export const EXTENSION_ID: string = 'IBMBlockchain.ibm-blockchain-platform';

// tslint:disable-next-line: max-classes-per-file
export class ExtensionUtil {

    static readonly DEBUG_PACKAGE_PREFIX: string = 'vscode-debug';

    public static getPackageJSON(): any {
        return this.getExtension().packageJSON;
    }

    public static isActive(): boolean {
        return this.getExtension().isActive;
    }

    public static activateExtension(): Thenable<void> {
        return this.getExtension().activate();
    }

    public static getExtensionPath(): string {
        return this.getExtension().extensionPath;
    }

    public static async getContractNameAndVersion(folder: vscode.WorkspaceFolder): Promise<{ name: string, version: string }> {
        try {
            const packageJson: any = await this.loadJSON(folder, 'package.json');
            return { name: packageJson.name, version: packageJson.version };
        } catch (error) {
            return;
        }
    }

    public static async loadJSON(folder: vscode.WorkspaceFolder, file: string): Promise<any> {
        try {
            const workspacePackage: string = path.join(folder.uri.fsPath, file);
            const workspacePackageContents: string = await fs.readFile(workspacePackage, 'utf8');
            return JSON.parse(workspacePackageContents);
        } catch (error) {
            throw new Error('error reading package.json from project ' + error.message);
        }
    }

    public static skipNpmInstall(): boolean {
        return false; // We should never skip npm install, except for unit tests
    }

    public static checkIfIBMer(): boolean {
        let isIBMer: boolean = false;
        const networkInterfaces: { [index: string]: os.NetworkInterfaceInfo[] } = os.networkInterfaces();
        const keys: string[] = Object.keys(networkInterfaces);
        keys.forEach((key: string) => {
            const interfaces: os.NetworkInterfaceInfo[] = networkInterfaces[key];
            const foundInterfaces: os.NetworkInterfaceInfo[] = interfaces.filter((_interface: os.NetworkInterfaceInfo) => {
                return _interface.family === 'IPv4' && _interface.address.startsWith('9.');
            });

            if (foundInterfaces.length > 0) {
                isIBMer = true;
            }
        });
        return isIBMer;
    }

    /*
    * Should only be called outside this file in tests
    */
    public static async registerCommands(context: vscode.ExtensionContext): Promise<vscode.ExtensionContext> {
        blockchainGatewayExplorerProvider = new BlockchainGatewayExplorerProvider();
        blockchainPackageExplorerProvider = new BlockchainPackageExplorerProvider();
        blockchainEnvironmentExplorerProvider = new BlockchainEnvironmentExplorerProvider();
        blockchainWalletExplorerProvider = new BlockchainWalletExplorerProvider();

        this.disposeExtension(context);

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.REFRESH_GATEWAYS, (element: BlockchainTreeItem) => blockchainGatewayExplorerProvider.refresh(element)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.CONNECT_TO_GATEWAY, (gateway: FabricGatewayRegistryEntry, identityName: string) => gatewayConnect(gateway, identityName)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DISCONNECT_GATEWAY, () => FabricGatewayConnectionManager.instance().disconnect()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.ADD_GATEWAY, () => addGateway()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DELETE_GATEWAY, (gateway: GatewayTreeItem) => deleteGateway(gateway)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.ADD_WALLET_IDENTITY, (walletItem: WalletTreeItem | FabricWalletRegistryEntry, mspid: string) => addWalletIdentity(walletItem, mspid)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.CREATE_SMART_CONTRACT_PROJECT, () => createSmartContractProject()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.PACKAGE_SMART_CONTRACT, (workspace?: vscode.WorkspaceFolder, overrideName?: string, overrideVersion?: string, overrideFabricVersion?: number) => packageSmartContract(workspace, overrideName, overrideVersion, overrideFabricVersion)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.REFRESH_PACKAGES, () => blockchainPackageExplorerProvider.refresh()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.REFRESH_ENVIRONMENTS, (element: BlockchainTreeItem) => blockchainEnvironmentExplorerProvider.refresh(element)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.START_FABRIC, (environmentRegistryEntry?: FabricEnvironmentRegistryEntry) => startFabricRuntime(environmentRegistryEntry)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.START_FABRIC_SHORT, (environmentRegistryEntry?: FabricEnvironmentRegistryEntry) => startFabricRuntime(environmentRegistryEntry)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.STOP_FABRIC_SHORT, (runtimeTreeItem?: RuntimeTreeItem) => stopFabricRuntime(runtimeTreeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.STOP_FABRIC, (runtimeTreeItem?: RuntimeTreeItem) => stopFabricRuntime(runtimeTreeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.RESTART_FABRIC, (runtimeTreeItem?: RuntimeTreeItem) => restartFabricRuntime(runtimeTreeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.RESTART_FABRIC_SHORT, (runtimeTreeItem?: RuntimeTreeItem) => restartFabricRuntime(runtimeTreeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.TEARDOWN_FABRIC_SHORT, (runtimeTreeItem?: RuntimeTreeItem, force: boolean = false, environmentName?: string, ignoreRefresh: boolean = false) => teardownFabricRuntime(runtimeTreeItem, force, environmentName, ignoreRefresh)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.EXPORT_CONNECTION_PROFILE, (gatewayItem: GatewayTreeItem, isConnected?: boolean) => exportConnectionProfile(gatewayItem, isConnected)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.EXPORT_CONNECTION_PROFILE_CONNECTED, (gatewayItem: GatewayTreeItem, isConnected: boolean = true) => exportConnectionProfile(gatewayItem, isConnected)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DELETE_SMART_CONTRACT, (project: PackageTreeItem) => deleteSmartContractPackage(project)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.EXPORT_SMART_CONTRACT, (project: PackageTreeItem) => exportSmartContractPackage(project)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.IMPORT_SMART_CONTRACT, () => importSmartContractPackageCommand()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.VIEW_PACKAGE_INFORMATION, (project: PackageTreeItem) => viewPackageInformation(project)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.ADD_ENVIRONMENT, () => addEnvironment()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DELETE_ENVIRONMENT_SHORT, (environmentTreeItem: FabricEnvironmentTreeItem | FabricEnvironmentRegistryEntry, force: boolean = false, ignoreRefresh: boolean = false) => deleteEnvironment(environmentTreeItem, force, ignoreRefresh)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.ASSOCIATE_IDENTITY_NODE, (environmentRegistryEntry: FabricEnvironmentRegistryEntry, node: FabricNode) => associateIdentityWithNode(false, environmentRegistryEntry, node)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.IMPORT_NODES_TO_ENVIRONMENT, (environmentRegistryEntry: FabricEnvironmentRegistryEntry, fromAddEnvironment: boolean = false, createMethod: string = UserInputUtil.ADD_ENVIRONMENT_FROM_NODES, informOfChanges: boolean = false, showSuccess: boolean, fromConnectEnvironment: boolean) => importNodesToEnvironment(environmentRegistryEntry, fromAddEnvironment, createMethod, informOfChanges, showSuccess, fromConnectEnvironment)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.EDIT_NODE_FILTERS, (environmentRegistryEntry: FabricEnvironmentRegistryEntry, fromAddEnvironment: boolean = false, createMethod: string = UserInputUtil.ADD_ENVIRONMENT_FROM_OPS_TOOLS, informOfChanges: boolean = false, showSuccess: boolean, fromConnectEnvironment: boolean) => importNodesToEnvironment(environmentRegistryEntry, fromAddEnvironment, createMethod, informOfChanges, showSuccess, fromConnectEnvironment)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.REPLACE_ASSOCIATED_IDENTITY, async (nodeTreeItem: NodeTreeItem) => {
            if (nodeTreeItem) {
                await associateIdentityWithNode(true, nodeTreeItem.environmentRegistryEntry, nodeTreeItem.node);
            } else {
                await associateIdentityWithNode(true, undefined, undefined);
            }
        }));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DELETE_NODE, (nodeTreeItem: NodeTreeItem | FabricNode) => deleteNode(nodeTreeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.HIDE_NODE, (nodeTreeItem: NodeTreeItem) => deleteNode(nodeTreeItem, true)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.CONNECT_TO_ENVIRONMENT, (fabricEnvironmentRegistryEntry: FabricEnvironmentRegistryEntry, showSuccessMessage: boolean) => fabricEnvironmentConnect(fabricEnvironmentRegistryEntry, showSuccessMessage)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DISCONNECT_ENVIRONMENT, () => FabricEnvironmentManager.instance().disconnect()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.INSTALL_SMART_CONTRACT, (orgMap: Map<string, string[]>, chosenPackge: PackageRegistryEntry) => installSmartContract(orgMap, chosenPackge)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.INSTANTIATE_SMART_CONTRACT, (channelName: string, peerNames: Array<string>, selectedPackage: any, instantiateFunctionName: string, instantiateFunctionArgs: string[], endorsementPolicy: any, collectionConfigPath: string) => instantiateSmartContract(channelName, peerNames, selectedPackage, instantiateFunctionName, instantiateFunctionArgs, endorsementPolicy, collectionConfigPath)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.APPROVE_SMART_CONTRACT, (ordererName: string, channelName: string, orgMap: Map<string, string[]>, smartContractDefinition: FabricSmartContractDefinition) => approveSmartContract(ordererName, channelName, orgMap, smartContractDefinition)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.COMMIT_SMART_CONTRACT, (ordererName: string, channelName: string, orgMap: Map<string, string[]>, smartContractDefinition: FabricSmartContractDefinition) => commitSmartContract(ordererName, channelName, orgMap, smartContractDefinition)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DEPLOY_SMART_CONTRACT, (requireCommit: boolean, fabricEnvironmentRegistryEntry: FabricEnvironmentRegistryEntry, ordererName: string, channelName: string, installApproveMap: Map<string, string[]>, chosenPackage: PackageRegistryEntry, smartContractDefinition: FabricSmartContractDefinition, commitMap?: Map<string, string[]>) => deploySmartContract(requireCommit, fabricEnvironmentRegistryEntry, ordererName, channelName, installApproveMap, chosenPackage, smartContractDefinition, commitMap)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.TEST_ALL_SMART_CONTRACT, (chaincode: InstantiatedContractTreeItem) => testSmartContract(true, chaincode)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.TEST_SMART_CONTRACT, (treeItem: ContractTreeItem | InstantiatedTreeItem) => testSmartContract(false, treeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.SUBMIT_TRANSACTION, (transactionTreeItem?: InstantiatedTreeItem | TransactionTreeItem, channelName?: string, smartContract?: string, transactionObject?: any) => submitTransaction(false, transactionTreeItem, channelName, smartContract, transactionObject)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.EVALUATE_TRANSACTION, (transactionTreeItem?: InstantiatedTreeItem | TransactionTreeItem, channelName?: string, smartContract?: string, transactionObject?: any) => submitTransaction(true, transactionTreeItem, channelName, smartContract, transactionObject)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.UPGRADE_SMART_CONTRACT, (channelName: string, peerNames: Array<string>, selectedPackage: PackageRegistryEntry, instantiateFunctionName: string, instantiateFunctionArgs: string[], endorsementPolicy: any, collectionConfigPath: string) => upgradeSmartContract(channelName, peerNames, selectedPackage, instantiateFunctionName, instantiateFunctionArgs, endorsementPolicy, collectionConfigPath)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.CREATE_NEW_IDENTITY, (certificateAuthorityTreeItem?: CertificateAuthorityTreeItem) => createNewIdentity(certificateAuthorityTreeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.REFRESH_WALLETS, (element: BlockchainTreeItem) => blockchainWalletExplorerProvider.refresh(element)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.ADD_WALLET, (createIdentity: boolean, environmentGroup?: string) => addWallet(createIdentity, environmentGroup)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DEBUG_COMMAND_LIST, (commandName?: string) => debugCommandList(commandName)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.REMOVE_WALLET, (treeItem: WalletTreeItem) => removeWallet(treeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DELETE_IDENTITY, (treeItem: IdentityTreeItem) => deleteIdentity(treeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.ASSOCIATE_WALLET, (treeItem: GatewayDissociatedTreeItem) => associateWallet(treeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DISSOCIATE_WALLET, (treeItem: GatewayAssociatedTreeItem) => dissociateWallet(treeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.EXPORT_WALLET, (treeItem?: WalletTreeItem) => exportWallet(treeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.ASSOCIATE_TRANSACTION_DATA_DIRECTORY, (treeItem: ContractTreeItem | InstantiatedTreeItem, associateFromViewOptions?: IAssociateFromViewOptions) => associateTransactionDataDirectory(treeItem, associateFromViewOptions)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DISSOCIATE_TRANSACTION_DATA_DIRECTORY, (treeItem?: ContractTreeItem | InstantiatedTreeItem, dissociateFromViewOptions?: IAssociateFromViewOptions) => dissociateTransactionDataDirectory(treeItem, dissociateFromViewOptions)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.SUBSCRIBE_TO_EVENT, (treeItem: ContractTreeItem | InstantiatedTreeItem) => subscribeToEvent(treeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_DEPLOY_PAGE, (fabricEnvironmentRegistryEntry: FabricEnvironmentRegistryEntry, channelName: string) => openDeployView(fabricEnvironmentRegistryEntry, channelName)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.SAVE_TUTORIAL_AS_PDF, (tutorialObject: any, saveAll?: boolean, tutorialFolder?: string) => saveTutorial(tutorialObject, saveAll, tutorialFolder)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.EXPORT_APP_DATA, (treeItem: ContractTreeItem | InstantiatedTreeItem) => exportAppData(treeItem)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.LOG_IN_AND_DISCOVER, () => logInAndDiscover()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_CONSOLE_IN_BROWSER, (environment?: FabricEnvironmentTreeItem ) => openConsoleInBrowser(environment)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DELETE_DIRECTORY, () => deleteExtensionDirectory()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_COUCHDB_IN_BROWSER, (environment?: FabricEnvironmentTreeItem ) => openCouchDbInBrowser(environment)));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_HOME_PAGE, async () => {
            const homeView: HomeView = new HomeView(context);
            await homeView.openView(true);
        }));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_SAMPLE_PAGE, async (repoName: string, sampleName: string) => {
            const sampleView: SampleView = new SampleView(context, repoName, sampleName);
            await sampleView.openView(false);
        }));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_TUTORIAL_GALLERY, async () => {
            const tutorialGalleryView: TutorialGalleryView = new TutorialGalleryView(context);
            await tutorialGalleryView.openView(true);
        }));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_SAMPLE_GALLERY, async () => {
            const sampleGalleryView: SampleGalleryView = new SampleGalleryView(context);
            await sampleGalleryView.openView(true);
        }));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_TUTORIAL_PAGE, async (seriesName: string, tutorialName: string) => {
            const tutorialView: TutorialView = new TutorialView(context, seriesName, tutorialName);
            await tutorialView.openView(true);
        }));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_FABRIC_2_PAGE, async () => {
            const fabric2View: Fabric2View = new Fabric2View(context);
            await fabric2View.openView(true, vscode.ViewColumn.Beside);
        }));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_TRANSACTION_PAGE, (treeItem: InstantiatedTreeItem | ContractTreeItem, selectedTransactionName: string) => {
            return openTransactionView(treeItem, selectedTransactionName);
        }));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.MANAGE_FEATURE_FLAGS, () => manageFeatureFlags()));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_NEW_INSTANCE_LINK, async () => {
            await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://cloud.ibm.com/catalog/services/blockchain-platform'));
            Reporter.instance().sendTelemetryEvent('openNewInstanceLink');
        }));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_RESOURCE_FILE, async (relativePath: string) => {
            const extensionPath: string = ExtensionUtil.getExtensionPath();
            const fullPath: string = path.join(extensionPath, relativePath);
            await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(fullPath));
        }));

        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_VSCODE_EXTENSION, async (url: string = defaultDependencies.optional.ibmCloudAccountExtension.url) => {
            await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
        }));

        const goDebugProvider: FabricGoDebugConfigurationProvider = new FabricGoDebugConfigurationProvider();
        const javaDebugProvider: FabricJavaDebugConfigurationProvider = new FabricJavaDebugConfigurationProvider();
        const nodeDebugProvider: FabricNodeDebugConfigurationProvider = new FabricNodeDebugConfigurationProvider();
        context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('fabric:go', goDebugProvider));
        context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('fabric:java', javaDebugProvider));
        context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('fabric:node', nodeDebugProvider));
        context.subscriptions.push(vscode.window.registerTreeDataProvider('environmentExplorer', blockchainEnvironmentExplorerProvider));

        context.subscriptions.push(vscode.window.registerTreeDataProvider('gatewaysExplorer', blockchainGatewayExplorerProvider));
        context.subscriptions.push(vscode.window.registerTreeDataProvider('aPackagesExplorer', blockchainPackageExplorerProvider));
        context.subscriptions.push(vscode.window.registerTreeDataProvider('walletExplorer', blockchainWalletExplorerProvider));

        // add homepage button in status bar
        const homePageButton: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        homePageButton.command = ExtensionCommands.OPEN_HOME_PAGE;
        homePageButton.text = 'Blockchain Home';
        homePageButton.tooltip = 'View Homepage';

        context.subscriptions.push(homePageButton);
        homePageButton.show();

        FabricWalletRegistry.instance().on(FileRegistry.EVENT_NAME, (async (): Promise<void> => {
            try {
                await vscode.commands.executeCommand(ExtensionCommands.REFRESH_WALLETS);
            } catch (error) {
                // ignore error this only happens in tests
            }
        }));

        FabricGatewayRegistry.instance().on(FileRegistry.EVENT_NAME, (async (): Promise<void> => {
            try {
                await vscode.commands.executeCommand(ExtensionCommands.REFRESH_GATEWAYS);
            } catch (error) {
                // ignore error this only happens in tests
            }
        }));

        FabricEnvironmentRegistry.instance().on(FileRegistry.EVENT_NAME, (async (): Promise<void> => {
            try {
                await vscode.commands.executeCommand(ExtensionCommands.REFRESH_ENVIRONMENTS);
                // need to refresh gateways and wallets if the environments are updated as some will be generated
                await vscode.commands.executeCommand(ExtensionCommands.REFRESH_GATEWAYS);
                await vscode.commands.executeCommand(ExtensionCommands.REFRESH_WALLETS);
            } catch (error) {
                // ignore error this only happens in tests
            }
        }));

        // We need to do context.subscriptions.push, otherwise this handler will register multiple times
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(async (e: any) => {

            if (e.affectsConfiguration(SettingConfigurations.EXTENSION_LOCAL_FABRIC)) {
                const runtimeManager: LocalMicroEnvironmentManager = LocalMicroEnvironmentManager.instance();

                const outputAdapter: VSCodeBlockchainOutputAdapter = VSCodeBlockchainOutputAdapter.instance();

                const localFabricEnabled: boolean = ExtensionUtil.getExtensionLocalFabricSetting();

                // If we're running on Eclipse Che, this is not a supported feature.
                if (ExtensionUtil.isChe()) {
                    if (localFabricEnabled) {
                        outputAdapter.log(LogType.ERROR, 'Local Fabric functionality is not supported in Eclipse Che or Red Hat CodeReady Workspaces.');
                        await vscode.workspace.getConfiguration().update(SettingConfigurations.EXTENSION_LOCAL_FABRIC, false, vscode.ConfigurationTarget.Global);
                    }
                    return;
                }

                const runtimes: LocalMicroEnvironment[] = [];
                const environmentEntries: FabricEnvironmentRegistryEntry[] = await FabricEnvironmentRegistry.instance().getAll([EnvironmentFlags.LOCAL]); // Get only local entries
                for (const entry of environmentEntries) {
                    const _runtime: LocalMicroEnvironment = await LocalMicroEnvironmentManager.instance().ensureRuntime(entry.name, undefined, entry.numberOfOrgs);
                    runtimes.push(_runtime); // We only want to teardown started or stopped runtimes.

                }

                if (!localFabricEnabled) {
                    // Just got set to false
                    try {
                        if (runtimes.length > 0) {
                            const reallyDoIt: boolean = await UserInputUtil.showConfirmationWarningMessage(`Toggling this feature will remove the world state and ledger data for all local runtimes. Do you want to continue?`);
                            if (!reallyDoIt) {
                                // log setting variable back
                                await vscode.workspace.getConfiguration().update(SettingConfigurations.EXTENSION_LOCAL_FABRIC, true, vscode.ConfigurationTarget.Global);
                                return;
                            }

                            for (const runtime of runtimes) {

                                const runtimeName: string = runtime.getName();

                                try {
                                    await vscode.commands.executeCommand(ExtensionCommands.TEARDOWN_FABRIC, undefined, true, runtimeName);
                                } catch (err) {
                                    // Ignore
                                }

                                // If disabled, delete the local environment, gateway and wallet.
                                // It's unlikely people will keep toggling the flag - doesn't matter if their local fabrics get deleted.
                                await FabricEnvironmentRegistry.instance().delete(runtimeName, true);

                                runtimeManager.removeRuntime(runtimeName);

                            }

                        }

                        await vscode.commands.executeCommand('setContext', 'local-fabric-enabled', false);

                    } catch (error) {
                        outputAdapter.log(LogType.ERROR, `Error whilst toggling local Fabric functionality to false: ${error.message}`, `Error whilst toggling local Fabric functionality to false: ${error.toString()}`);
                    }

                } else {
                    // Just got set to true
                    try {
                        const bypassPreReqs: boolean = vscode.workspace.getConfiguration().get(SettingConfigurations.EXTENSION_BYPASS_PREREQS);
                        let dependenciesInstalled: boolean = true;

                        if (!bypassPreReqs) {
                            const dependencyManager: DependencyManager = DependencyManager.instance();
                            dependenciesInstalled = await dependencyManager.hasPreReqsInstalled();
                            if (!dependenciesInstalled) {

                                const ctx: vscode.ExtensionContext = GlobalState.getExtensionContext();

                                this.disposeExtension(ctx);
                                await this.registerPreActivationCommands(ctx);
                                const tempCommandRegistry: TemporaryCommandRegistry = TemporaryCommandRegistry.instance();

                                tempCommandRegistry.createTempCommands(false, ExtensionCommands.OPEN_PRE_REQ_PAGE);
                                await vscode.commands.executeCommand(ExtensionCommands.OPEN_PRE_REQ_PAGE);
                                return;
                            }
                        }

                        await vscode.commands.executeCommand('setContext', 'local-fabric-enabled', true);
                    } catch (error) {
                        outputAdapter.log(LogType.ERROR, `Error whilst toggling local Fabric functionality to true: ${error.message}`, `Error whilst toggling local Fabric functionality to true: ${error.toString()}`);
                    }
                }

                const extensionData: ExtensionData = GlobalState.get();

                if (localFabricEnabled && !extensionData.deletedOneOrgLocalFabric) {

                    const localRuntime: LocalMicroEnvironment = LocalMicroEnvironmentManager.instance().getRuntime(FabricRuntimeUtil.LOCAL_FABRIC);

                    if (!localRuntime) {
                        // Just been set to true and there is no local runtime.
                        outputAdapter.log(LogType.INFO, undefined, 'Initializing local runtime manager');
                        try {
                            await runtimeManager.initialize(FabricRuntimeUtil.LOCAL_FABRIC, 1);

                            extensionData.createOneOrgLocalFabric = false;
                            await GlobalState.update(extensionData);

                        } catch (error) {
                            outputAdapter.log(LogType.ERROR, `Error initializing ${FabricRuntimeUtil.LOCAL_FABRIC}: ${error.message}`, `Error initializing ${FabricRuntimeUtil.LOCAL_FABRIC}: ${error.toString()}`);
                        }
                    }
                }

                // Show/Hide Local Fabric tree items
                await vscode.commands.executeCommand(ExtensionCommands.REFRESH_ENVIRONMENTS);
                await vscode.commands.executeCommand(ExtensionCommands.REFRESH_GATEWAYS);
                await vscode.commands.executeCommand(ExtensionCommands.REFRESH_WALLETS);
            }
        }));

        // vscode.debug.onDidChangeActiveDebugSession(async (e: vscode.DebugSession) => {
        //     // Listen for any changes to the debug state.
        //     if (e && e.configuration && e.configuration.debugEvent === FabricDebugConfigurationProvider.debugEvent) {
        //         await vscode.commands.executeCommand('setContext', 'blockchain-debug', true);
        //         if (e.configuration.env && e.configuration.env.CORE_CHAINCODE_ID_NAME) {
        //             const smartContractName: string = e.configuration.env.CORE_CHAINCODE_ID_NAME.split(':')[0];
        //             const smartContractVersion: string = e.configuration.env.CORE_CHAINCODE_ID_NAME.split(':')[1];
        //             const instantiatedSmartContract: FabricSmartContractDefinition = await FabricDebugConfigurationProvider.getInstantiatedChaincode(smartContractName);

        //             if (!instantiatedSmartContract) {
        //                 await vscode.commands.executeCommand(ExtensionCommands.DEBUG_COMMAND_LIST, ExtensionCommands.INSTANTIATE_SMART_CONTRACT);
        //             } else if (smartContractVersion !== instantiatedSmartContract.version) {
        //                 await vscode.commands.executeCommand(ExtensionCommands.DEBUG_COMMAND_LIST, ExtensionCommands.UPGRADE_SMART_CONTRACT);
        //             }
        //         }
        //         // Show any new transactions added to a contract, after 'reload debug' is executed.
        //         await vscode.commands.executeCommand(ExtensionCommands.REFRESH_GATEWAYS);
        //     } else {
        //         // debug has stopped so set the context to false
        //         await vscode.commands.executeCommand('setContext', 'blockchain-debug', false);
        //     }
        // });

        let connectedRuntime: LocalMicroEnvironment; // Currently connected environment entry

        FabricEnvironmentManager.instance().on('connected', async () => {
            const registryEntry: FabricEnvironmentRegistryEntry = FabricEnvironmentManager.instance().getEnvironmentRegistryEntry();
            if (registryEntry.environmentType === EnvironmentType.LOCAL_MICROFAB_ENVIRONMENT) {
                connectedRuntime = LocalMicroEnvironmentManager.instance().getRuntime(registryEntry.name);
                const outputAdapter: VSCodeBlockchainDockerOutputAdapter = VSCodeBlockchainDockerOutputAdapter.instance(registryEntry.name);
                connectedRuntime.startLogs(outputAdapter);
            } else {
                connectedRuntime = undefined;
            }

        });

        FabricEnvironmentManager.instance().on('disconnected', async () => {
            if (connectedRuntime instanceof LocalMicroEnvironment) {
                connectedRuntime.stopLogs();
                connectedRuntime = undefined;
            }
        });

        context = await this.registerPreActivationCommands(context);

        const packageJson: any = ExtensionUtil.getPackageJSON();

        if (packageJson.production === true) {
            context.subscriptions.push(Reporter.instance());
        }

        return context;
    }

    public static async setupLocalRuntime(): Promise<void> {
        const outputAdapter: VSCodeBlockchainOutputAdapter = VSCodeBlockchainOutputAdapter.instance();

        outputAdapter.log(LogType.INFO, undefined, 'Initializing local runtime manager');
        await LocalMicroEnvironmentManager.instance().initialize(FabricRuntimeUtil.LOCAL_FABRIC, 1);
    }

    public static async setupCommands(): Promise<void> {
        const outputAdapter: VSCodeBlockchainOutputAdapter = VSCodeBlockchainOutputAdapter.instance();
        const dependencyManager: DependencyManager = DependencyManager.instance();

        outputAdapter.log(LogType.INFO, undefined, 'Clearing extension cache');
        await dependencyManager.clearExtensionCache();

        const extensionData: ExtensionData = GlobalState.get();
        const localFabricEnabled: boolean = this.getExtensionLocalFabricSetting();

        const tempCommandRegistry: TemporaryCommandRegistry = TemporaryCommandRegistry.instance();
        outputAdapter.log(LogType.INFO, undefined, 'Restoring command registry');
        tempCommandRegistry.restoreCommands();

        FabricConnectionFactory.createFabricWallet();

        outputAdapter.log(LogType.INFO, undefined, 'Registering commands');
        const context: vscode.ExtensionContext = GlobalState.getExtensionContext();
        await ExtensionUtil.registerCommands(context);

        if (localFabricEnabled) {
            if (extensionData.createOneOrgLocalFabric) {
                await ExtensionUtil.setupLocalRuntime();
                extensionData.createOneOrgLocalFabric = false;
                await GlobalState.update(extensionData);
            }
        } else {
            await FabricEnvironmentRegistry.instance().delete(FabricRuntimeUtil.LOCAL_FABRIC, true);
            LocalMicroEnvironmentManager.instance().removeRuntime(FabricRuntimeUtil.LOCAL_FABRIC);
        }

        outputAdapter.log(LogType.INFO, undefined, 'Execute stored commands in the registry');
        await tempCommandRegistry.executeStoredCommands();
    }

    public static async completeActivation(extensionUpdated?: boolean): Promise<void> {
        const outputAdapter: VSCodeBlockchainOutputAdapter = VSCodeBlockchainOutputAdapter.instance();

        const extensionData: ExtensionData = GlobalState.get();

        if (extensionUpdated === undefined) {
            extensionUpdated = currentExtensionVersion !== extensionData.version;
        }

        // Only popup if the extension has been updated.
        if (extensionUpdated) {
            outputAdapter.log(LogType.INFO, 'IBM Blockchain Platform Extension activated');
        } else {
            outputAdapter.log(LogType.INFO, null, 'IBM Blockchain Platform Extension activated');
        }

        // Detects if the user wants to have the Home page appear the next time the extension is activated, or the first time they click on the extension's icon.
        // If the latter, only do this if the extension has been updated.
        const showPage: boolean = vscode.workspace.getConfiguration().get(SettingConfigurations.HOME_SHOW_ON_STARTUP);
        const showPageNext: boolean = vscode.workspace.getConfiguration().get(SettingConfigurations.HOME_SHOW_ON_NEXT_ACTIVATION);
        if (showPageNext || (extensionUpdated && showPage)) {
            // Open the Home page
            await vscode.commands.executeCommand(ExtensionCommands.OPEN_HOME_PAGE);
            // Reset SHOW_ON_NEXT_ACTIVATION if needed
            if (showPageNext) {
                await vscode.workspace.getConfiguration().update(SettingConfigurations.HOME_SHOW_ON_NEXT_ACTIVATION, false, vscode.ConfigurationTarget.Global);
            }
        }

        // Check if there is a newer version of the generator available
        // This needs to be done as a seperate call to make sure the dependencies have been installed
        const generatorVersion: string = dependencies['generator-fabric'];

        if (extensionData.generatorVersion && generatorVersion !== extensionData.generatorVersion) {
            // If the latest generator version is not equal to the previous used version

            let teardownRuntimes: boolean = false;
            let updateGeneratorVersion: boolean = true;

            const envEntries: FabricEnvironmentRegistryEntry[] = await FabricEnvironmentRegistry.instance().getAll([EnvironmentFlags.LOCAL]);

            // If the user has no local environments, we can just update the global state automatically.
            if (envEntries.length > 0) {
                const runtimeManager: LocalMicroEnvironmentManager = LocalMicroEnvironmentManager.instance();

                const runtimes: LocalMicroEnvironment[] = [];
                for (const entry of envEntries) {

                    const localRuntime: LocalMicroEnvironment = await runtimeManager.ensureRuntime(entry.name, undefined, entry.numberOfOrgs);
                    runtimes.push(localRuntime);
                }

                const generatorSemver: semver.SemVer = semver.coerce(generatorVersion); // Generator semver
                const storedSemver: semver.SemVer = semver.coerce(extensionData.generatorVersion); // Stored generator semver

                const generatorMajor: number = generatorSemver.major;
                const storedMajor: number = storedSemver.major;
                if (generatorMajor > storedMajor) {
                    // If major changes, then we should just force teardown without asking.
                    teardownRuntimes = true;
                }

                if (!teardownRuntimes) {
                    teardownRuntimes = await UserInputUtil.showConfirmationWarningMessage(`The local runtime configurations are out of date and must be torn down before updating. Do you want to teardown your local runtimes now?`);
                } else {
                    outputAdapter.log(LogType.IMPORTANT, `A major version of the generator has been released. All local runtimes will be torn down.`);
                }

                if (teardownRuntimes) {

                    for (const runtime of runtimes) {

                        const created: boolean = await runtime.isCreated();

                        const runtimeName: string = runtime.getName();

                        if (created) {
                            // We know the user has a create Fabric using an older version, so we should give the user the option to teardown either now or later

                            const isRunning: boolean = await runtime.isRunning();

                            // Teardown and remove generated Fabric
                            await vscode.commands.executeCommand(ExtensionCommands.TEARDOWN_FABRIC, undefined, true, runtimeName);

                            // Was it running before tearing it down?
                            if (isRunning) {

                                // Find environment entry of runtime
                                const envEntry: FabricEnvironmentRegistryEntry = envEntries.find((env: FabricEnvironmentRegistryEntry) => {
                                    return env.name === runtime.getName();
                                });

                                // Start the Fabric again
                                await vscode.commands.executeCommand(ExtensionCommands.START_FABRIC, envEntry);
                            }

                        }
                    }
                    // If they don't have a Fabric generated, we can update the version immediately
                } else {
                    updateGeneratorVersion = false;
                }
            }

            // Update the generator version
            if (updateGeneratorVersion) {
                extensionData.generatorVersion = generatorVersion;
                await GlobalState.update(extensionData);
            }
        }

        const localFabricEnabled: boolean = this.getExtensionLocalFabricSetting();
        if (localFabricEnabled) {
            await vscode.commands.executeCommand('setContext', 'local-fabric-enabled', true);
        } else {
            await vscode.commands.executeCommand('setContext', 'local-fabric-enabled', false);
        }

        const features: Map<string, boolean> = await FeatureFlagManager.get();
        for (const feature of FeatureFlagManager.ALL) {
            const hasContext: boolean = feature.getContext();
            if (hasContext) {
                if (!!features[feature.getName()]) {
                    // feature enabled
                    await vscode.commands.executeCommand('setContext', feature.getName(), true);
                } else {
                    await vscode.commands.executeCommand('setContext', feature.getName(), false);
                }
            }
        }

        if (!extensionData.generatorVersion) {
            extensionData.generatorVersion = generatorVersion;
            await GlobalState.update(extensionData);
        }

        // Discover any environments and ensure they are available.
        await this.discoverEnvironments();
    }

    /*
 * Needed for testing
 */
    public static getBlockchainGatewayExplorerProvider(): BlockchainGatewayExplorerProvider {
        return blockchainGatewayExplorerProvider;
    }

    public static getBlockchainEnvironmentExplorerProvider(): BlockchainEnvironmentExplorerProvider {
        return blockchainEnvironmentExplorerProvider;
    }

    public static getBlockchainPackageExplorerProvider(): BlockchainPackageExplorerProvider {
        return blockchainPackageExplorerProvider;
    }

    public static getBlockchainWalletExplorerProvider(): BlockchainWalletExplorerProvider {
        return blockchainWalletExplorerProvider;
    }

    public static disposeExtension(context: vscode.ExtensionContext): void {
        // remove old subscriptions
        context.subscriptions.forEach((item: vscode.Disposable) => {
            if (item) {
                item.dispose();
            }
        });
        context.subscriptions.splice(0, context.subscriptions.length);
    }

    public static async registerPreActivationCommands(context: vscode.ExtensionContext): Promise<vscode.ExtensionContext> {
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_PRE_REQ_PAGE, async (d: Dependencies) => {
            const preReqView: PreReqView = new PreReqView(context, d);
            await preReqView.openView(true);
        }));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.OPEN_RELEASE_NOTES, () => openReleaseNotes()));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.DELETE_ENVIRONMENT, (environmentTreeItem: FabricEnvironmentTreeItem | FabricEnvironmentRegistryEntry, force: boolean = false, ignoreRefresh: boolean = false) => deleteEnvironment(environmentTreeItem, force, ignoreRefresh)));
        context.subscriptions.push(vscode.commands.registerCommand(ExtensionCommands.TEARDOWN_FABRIC, (runtimeTreeItem?: RuntimeTreeItem, force: boolean = false, environmentName?: string, ignoreRefresh: boolean = false) => teardownFabricRuntime(runtimeTreeItem, force, environmentName, ignoreRefresh)));

        return context;
    }

    public static getExtensionLocalFabricSetting(): boolean {
        return vscode.workspace.getConfiguration().get(SettingConfigurations.EXTENSION_LOCAL_FABRIC);
    }

    public static getExtensionSaasConfigUpdatesSetting(): boolean {
        return vscode.workspace.getConfiguration().get(SettingConfigurations.EXTENSION_SAAS_CONFIG_UPDATES);
    }

    public static async discoverEnvironments(): Promise<void> {

        // First, check to see if we're running in Eclipse Che; currently
        // we can only discover environments created by Eclipse Che.
        if (ExtensionUtil.isChe()) {
            await this.discoverCheEnvironments();
        }

    }

    public static async discoverCheEnvironments(): Promise<void> {

        // Check for a Microfab instance running within this Eclipse Che.
        const MICROFAB_SERVICE_HOST: string = process.env['MICROFAB_SERVICE_HOST'];
        const MICROFAB_SERVICE_PORT: string = process.env['MICROFAB_SERVICE_PORT'];
        if (!MICROFAB_SERVICE_HOST || !MICROFAB_SERVICE_PORT) {
            return;
        }
        const url: string = `http://${MICROFAB_SERVICE_HOST}:${MICROFAB_SERVICE_PORT}`;

        // Try to connect to the Microfab instance.
        try {
            await Axios.get(new URL('/ak/api/v1/health', url).toString());
        } catch (error) {
            // This isn't a valid Microfab instance.
            return;
        }

        // Determine where this environment should store any files.
        const extensionDirectory: string = vscode.workspace.getConfiguration().get(SettingConfigurations.EXTENSION_DIRECTORY);
        const resolvedExtensionDirectory: string = FileSystemUtil.getDirPath(extensionDirectory);
        const environmentDirectory: string = path.join(resolvedExtensionDirectory, FileConfigurations.FABRIC_ENVIRONMENTS, 'Microfab');

        // Register the Microfab instance.
        const environmentRegistry: FabricEnvironmentRegistry = FabricEnvironmentRegistry.instance();
        const environmentExists: boolean = await environmentRegistry.exists('Microfab');

        const environmentRegistryEntry: FabricEnvironmentRegistryEntry = new FabricEnvironmentRegistryEntry({
            name: 'Microfab',
            managedRuntime: false,
            environmentType: EnvironmentType.MICROFAB_ENVIRONMENT,
            environmentDirectory,
            url
        });
        if (!environmentExists) {
            await environmentRegistry.add(environmentRegistryEntry);
        } else {
            await environmentRegistry.update(environmentRegistryEntry);
        }

    }

    public static isChe(): boolean {
        return 'CHE_WORKSPACE_ID' in process.env;
    }

    private static getExtension(): vscode.Extension<any> {
        return vscode.extensions.getExtension(EXTENSION_ID);
    }
}
