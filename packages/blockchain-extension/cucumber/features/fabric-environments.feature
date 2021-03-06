Feature: Fabric Environments
  Tests all the features of the fabric ops panel

    Scenario Outline: There should be a tree item (disconnected)
        Given the 1 Org Local Fabric environment is running
        Then there should be a tree item with a label 'Simple local networks' in the 'Fabric Environments' panel
        And the 'Fabric Environments' tree item should have a child '<label>'
        And the tree item should have a tooltip equal to '<tooltip>'
        Examples:
        | label                     | tooltip                                  |
        | 1 Org Local Fabric  ●     | The local development runtime is running |

  # Scenario Outline: There should be a tree item (connected)
  #   Given the 1 Org Local Fabric environment is running
  #   And the '1 Org Local Fabric' environment is connected
  #   Then there should be a <treeItem> tree item with a label '<label>' in the 'Fabric Environments' panel
  #   And the tree item should have a tooltip equal to '<tooltip>'
  #   Examples:
  #     | treeItem              | label                                        | tooltip                                                                 |
  #     | environment connected | Connected to environment: 1 Org Local Fabric | Connected to environment: 1 Org Local Fabric                            |
  #     | channel               | mychannel                                    | Associated peers: Org1Peer1                                             |
  #     | Node                  | Org1Peer1                                    | Name: Org1Peer1\\nMSPID: Org1MSP\\nAssociated Identity:\\norg1Admin     |
  #     | Node                  | OrdererCA                                    | Name: OrdererCA\\nAssociated Identity:\\nadmin                          |
  #     | Node                  | Org1CA                                       | Name: Org1CA\\nAssociated Identity:\\nadmin                             |
  #     | Node                  | Orderer                                      | Name: Orderer\\nMSPID: OrdererMSP\\nAssociated Identity:\\nordererAdmin |
  #     | Organizations         | OrdererMSP                                   | OrdererMSP                                                              |
  #     | Organizations         | Org1MSP                                      | Org1MSP                                                                 |


  Scenario Outline: It should persist data after being stopped
    Given the 1 Org Local Fabric environment is running
    And the '1 Org Local Fabric' environment is connected
    And a <language> smart contract for <assetType> assets with the name <name> and version <version>
    And the contract has been created
    And the contract has been packaged as a tar.gz
    And the contract has been deployed on channel 'mychannel'
    When I stop the 1 Org Local Fabric
    Then there should be a tree item with a label 'Simple local networks' in the 'Fabric Environments' panel
    And the 'Fabric Environments' tree item should have a child '<label>'
    Then the tree item should have a tooltip equal to '<tooltip>'
    When I start the 1 Org Local Fabric
    And the '1 Org Local Fabric' environment is connected
    Then there should be a committed smart contract tree item with a label '<committedName>' in the 'Fabric Environments' panel for item mychannel
    Examples:
      | language   | assetType | name               | committedName            | version | label                                  | tooltip                                                                    |
      | JavaScript | Conga     | JavaScriptContract | JavaScriptContract@0.0.1 | 0.0.1   | 1 Org Local Fabric  ○ (click to start) | Creates a local development runtime using Hyperledger Fabric Docker images |

  @otherFabric
  Scenario: It should create an environment
    When I create an environment 'myFabric'
    Then there should be a tree item with a label 'Other networks' in the 'Fabric Environments' panel
    And the 'Fabric Environments' tree item should have a child 'myFabric'
    And the tree item should have a tooltip equal to 'myFabric'

  # TODO - comment back in when IBP supports v2
  # @opsToolsFabric
  #   Scenario: It should automatically add a discovered SaaS environment
  #     Given there are no IBM Cloud environments
  #     When I log in to IBM Cloud
  #     Then there should be a tree item with a label 'IBM Blockchain Platform on cloud' in the 'Fabric Environments' panel
  #     And the 'Fabric Environments' tree item should have a child 'vscode'
  #     And the tree item should have a tooltip equal to 'vscode'

  @opsToolsFabric
  Scenario Outline: It should create an environment without nodes
    When I create an environment '<environmentName>' of type '<environmentType>'
    And the wallet '<walletName>' with identity '<identtity>' and mspid '<mspid>' exists
    Then there should be a tree item with a label 'IBM Blockchain Platform on cloud' in the 'Fabric Environments' panel
    And the 'Fabric Environments' tree item should have a child '<environmentName>'
    And the tree item should have a tooltip equal to '<environmentName>'
    And there should be a tree item with a label 'Other wallets' in the 'Fabric Wallets' panel
    And the 'Fabric Wallets' tree item should have a child '<walletName>'
    Examples:
      | environmentName      | environmentType    | walletName            | identtity         | mspid     |
      | myOpsToolsFabric     | software           | opsToolsWallet        | Org1CAAdmin       | org1msp   |
      | mySaaSOpsToolsFabric | SaaS               | SaaSOpsToolsWallet    | SaaSOrg1CAAdmin   | org1msp   |

  @opsToolsFabric
  Scenario Outline: It should edit filters, add all nodes and connect automatically
    Given an environment '<environmentName>' of type '<environmentType>' exists
    When I edit filters and import all nodes to environment '<environmentName>'
    Then the '<environmentName>' environment is connected
    Examples:
      | environmentName      | environmentType |
      | myOpsToolsFabric     | software        |
      | mySaaSOpsToolsFabric | SaaS            |

  @opsToolsFabric
  Scenario Outline: It should setup environment
    Given an environment '<environmentName>' of type '<environmentType>' exists
    And I have edited filters and imported all nodes to environment '<environmentName>'
    And the '<environmentName>' environment is connected
    Then there should be a tree item with a label '<label>' in the 'Fabric Environments' panel
    And the tree item should have a tooltip equal to '<tooltip>'
    Examples:
      | environmentName      | environmentType | label                              | tooltip                            |
      | myOpsToolsFabric     | software        | Setting up: myOpsToolsFabric       | Setting up: myOpsToolsFabric       |
      | myOpsToolsFabric     | software        | (Click each node to perform setup) | (Click each node to perform setup) |
      | myOpsToolsFabric     | software        | Ordering Service CA   ⚠            | Ordering Service CA                |
      | myOpsToolsFabric     | software        | Ordering Service   ⚠               | Ordering Service                   |
      | myOpsToolsFabric     | software        | Org1 CA   ⚠                        | Org1 CA                            |
      | myOpsToolsFabric     | software        | Org2 CA   ⚠                        | Org2 CA                            |
      | myOpsToolsFabric     | software        | Peer Org1   ⚠                      | Peer Org1                          |
      | myOpsToolsFabric     | software        | Peer Org2   ⚠                      | Peer Org2                          |
      | mySaaSOpsToolsFabric | SaaS            | Setting up: mySaaSOpsToolsFabric   | Setting up: mySaaSOpsToolsFabric   |
      | mySaaSOpsToolsFabric | SaaS            | (Click each node to perform setup) | (Click each node to perform setup) |
      | mySaaSOpsToolsFabric | SaaS            | Ordering Service CA   ⚠            | Ordering Service CA                |
      | mySaaSOpsToolsFabric | SaaS            | Ordering Service   ⚠               | Ordering Service                   |
      | mySaaSOpsToolsFabric | SaaS            | Org1 CA   ⚠                        | Org1 CA                            |
      | mySaaSOpsToolsFabric | SaaS            | Peer Org1   ⚠                      | Peer Org1                          |

  @opsToolsFabric
  Scenario Outline: It should associate nodes with identities
    Given an environment '<environmentName>' of type '<environmentType>' exists
    And I have edited filters and imported all nodes to environment '<environmentName>'
    And the '<environmentName>' environment is connected
    And the wallet '<wallet>' with identity '<existingIdentity>' and mspid '<existingMspid>' exists
    When I create an identity using JSON file with identity name '<identity>' and mspid '<mspid>' in wallet '<wallet>'
    And I associate identity '<identity>' in wallet '<wallet>' with node '<nodeName>'
    Then the log should have been called with 'SUCCESS' and 'Successfully added identity'
    Examples:
      | environmentName      | environmentType | nodeName            | wallet             | existingIdentity | existingMspid | identity                    | mspid   |
      | myOpsToolsFabric     | software        | Ordering Service CA | opsToolsWallet     | Org1CAAdmin      | org1msp       | OrderingServiceCAAdmin      | osmsp   |
      | myOpsToolsFabric     | software        | Ordering Service_1  | opsToolsWallet     | Org1CAAdmin      | org1msp       | OrderingServiceMSPAdmin     | osmsp   |
      | myOpsToolsFabric     | software        | Org1 CA             | opsToolsWallet     | Org1CAAdmin      | org1msp       | Org1CAAdmin                 | org1msp |
      | myOpsToolsFabric     | software        | Org2 CA             | opsToolsWallet     | Org1CAAdmin      | org1msp       | Org2CAAdmin                 | org2msp |
      | myOpsToolsFabric     | software        | Peer Org1           | opsToolsWallet     | Org1CAAdmin      | org1msp       | Org1MSPAdmin                | org1msp |
      | myOpsToolsFabric     | software        | Peer Org2           | opsToolsWallet     | Org1CAAdmin      | org1msp       | Org2MSPAdmin                | org2msp |
      | mySaaSOpsToolsFabric | SaaS            | Ordering Service CA | SaaSOpsToolsWallet | SaaSOrg1CAAdmin  | org1msp       | SaaSOrderingServiceCAAdmin  | osmsp   |
      | mySaaSOpsToolsFabric | SaaS            | Ordering Service_1  | SaaSOpsToolsWallet | SaaSOrg1CAAdmin  | org1msp       | SaaSOrderingServiceMSPAdmin | osmsp   |
      | mySaaSOpsToolsFabric | SaaS            | Org1 CA             | SaaSOpsToolsWallet | SaaSOrg1CAAdmin  | org1msp       | SaaSOrg1CAAdmin             | org1msp |
      | mySaaSOpsToolsFabric | SaaS            | Peer Org1           | SaaSOpsToolsWallet | SaaSOrg1CAAdmin  | org1msp       | SaaSOrg1MSPAdmin            | org1msp |

  @opsToolsFabric
  Scenario Outline: It should connect to a software environment
    Given an environment 'myOpsToolsFabric' of type 'software' exists
    And the wallet 'opsToolsWallet' with identity 'Org1CAAdmin' and mspid 'org1msp' exists
    And the wallet 'opsToolsWallet' with identity 'Org2CAAdmin' and mspid 'org2msp' exists
    And the wallet 'opsToolsWallet' with identity 'OrderingServiceCAAdmin' and mspid 'osmsp' exists
    And the wallet 'opsToolsWallet' with identity 'OrderingServiceMSPAdmin' and mspid 'osmsp' exists
    And the wallet 'opsToolsWallet' with identity 'Org1MSPAdmin' and mspid 'org1msp' exists
    And the wallet 'opsToolsWallet' with identity 'Org2MSPAdmin' and mspid 'org2msp' exists
    And I have edited filters and imported all nodes to environment 'myOpsToolsFabric'
    And the 'software' opstools environment is setup
    And the 'myOpsToolsFabric' environment is connected
    Then there should be a <treeItem> tree item with a label '<label>' in the 'Fabric Environments' panel
    And the tree item should have a tooltip equal to '<tooltip>'
    Examples:
      | treeItem                    | label                                       | tooltip                                                                                |
      | environment connected       | Connected to environment: myOpsToolsFabric  | Connected to environment: myOpsToolsFabric                                             |
      | installed smart contract    | + Install                                   | + Install                                                                              |
      | instantiated smart contract | + Instantiate                               | + Instantiate                                                                          |
      | Channels                    | channel1                                    | Associated peers: Peer Org1, Peer Org2\\nChannel capabilities: V2_0                    |
      | Node                        | Ordering Service CA                         | Name: Ordering Service CA\\nAssociated Identity:\\nOrderingServiceCAAdmin              |
      | Node                        | Ordering Service                            | Name: Ordering Service\\nMSPID: osmsp\\nAssociated Identity:\\nOrderingServiceMSPAdmin |
      | Node                        | Org1 CA                                     | Name: Org1 CA\\nAssociated Identity:\\nOrg1CAAdmin                                     |
      | Node                        | Org2 CA                                     | Name: Org2 CA\\nAssociated Identity:\\nOrg2CAAdmin                                     |
      | Node                        | Peer Org1                                   | Name: Peer Org1\\nMSPID: org1msp\\nAssociated Identity:\\nOrg1MSPAdmin                 |
      | Node                        | Peer Org2                                   | Name: Peer Org2\\nMSPID: org2msp\\nAssociated Identity:\\nOrg2MSPAdmin                 |
      | Organizations               | osmsp                                       | osmsp                                                                                  |
      | Organizations               | org1msp                                     | org1msp                                                                                |
      | Organizations               | org2msp                                     | org2msp                                                                                |

  @opsToolsFabric
  Scenario Outline: It should connect to a SaaS environment
    Given an environment 'mySaaSOpsToolsFabric' of type 'SaaS' exists
    And the wallet 'SaaSOpsToolsWallet' with identity 'SaaSOrg1CAAdmin' and mspid 'org1msp' exists
    And the wallet 'SaaSOpsToolsWallet' with identity 'SaaSOrderingServiceCAAdmin' and mspid 'osmsp' exists
    And the wallet 'SaaSOpsToolsWallet' with identity 'SaaSOrderingServiceMSPAdmin' and mspid 'osmsp' exists
    And the wallet 'SaaSOpsToolsWallet' with identity 'SaaSOrg1MSPAdmin' and mspid 'org1msp' exists
    And I have edited filters and imported all nodes to environment 'mySaaSOpsToolsFabric'
    And the 'SaaS' opstools environment is setup
    And the 'mySaaSOpsToolsFabric' environment is connected
    Then there should be a <treeItem> tree item with a label '<label>' in the 'Fabric Environments' panel
    And the tree item should have a tooltip equal to '<tooltip>'
    Examples:
      | treeItem                    | label                                          | tooltip                                                                                    |
      | environment connected       | Connected to environment: mySaaSOpsToolsFabric | Connected to environment: mySaaSOpsToolsFabric                                             |
      | installed smart contract    | + Install                                      | + Install                                                                                  |
      | instantiated smart contract | + Instantiate                                  | + Instantiate                                                                              |
      | Channels                    | channel1                                       | Associated peers: Peer Org1\\nChannel capabilities: V2_0                                                                 |
      | Node                        | Ordering Service CA                            | Name: Ordering Service CA\\nAssociated Identity:\\nSaaSOrderingServiceCAAdmin              |
      | Node                        | Ordering Service                               | Name: Ordering Service\\nMSPID: osmsp\\nAssociated Identity:\\nSaaSOrderingServiceMSPAdmin |
      | Node                        | Org1 CA                                        | Name: Org1 CA\\nAssociated Identity:\\nSaaSOrg1CAAdmin                                     |
      | Node                        | Peer Org1                                      | Name: Peer Org1\\nMSPID: org1msp\\nAssociated Identity:\\nSaaSOrg1MSPAdmin                 |
      | Organizations               | osmsp                                          | osmsp                                                                                      |
      | Organizations               | org1msp                                        | org1msp                                                                                    |

  @opsToolsFabric
  Scenario: It should hide nodes on a software environment
    Given an environment 'myOpsToolsFabric' of type 'software' exists
    And the wallet 'opsToolsWallet' with identity 'Org1CAAdmin' and mspid 'org1msp' exists
    And the wallet 'opsToolsWallet' with identity 'Org2CAAdmin' and mspid 'org2msp' exists
    And the wallet 'opsToolsWallet' with identity 'OrderingServiceCAAdmin' and mspid 'osmsp' exists
    And the wallet 'opsToolsWallet' with identity 'OrderingServiceMSPAdmin' and mspid 'osmsp' exists
    And the wallet 'opsToolsWallet' with identity 'OrderingServiceMSPAdmin' and mspid 'osmsp' exists
    And the wallet 'opsToolsWallet' with identity 'Org1MSPAdmin' and mspid 'org1msp' exists
    And the wallet 'opsToolsWallet' with identity 'Org2MSPAdmin' and mspid 'org2msp' exists
    And I have edited filters and imported all nodes to environment 'myOpsToolsFabric'
    And the 'software' opstools environment is setup
    And the 'myOpsToolsFabric' environment is connected
    When I hide the node 'Org2 CA'
    Then there shouldn't be a tree item with a label 'Org2 CA' in the 'Fabric Environments' panel
    And the log should have been called with 'SUCCESS' and 'Successfully hid node Org2 CA'

  @opsToolsFabric
  Scenario: It should hide nodes on a SaaS environment
    Given an environment 'mySaaSOpsToolsFabric' of type 'SaaS' exists
    And the wallet 'SaaSOpsToolsWallet' with identity 'SaaSOrg1CAAdmin' and mspid 'org1msp' exists
    And the wallet 'SaaSOpsToolsWallet' with identity 'SaaSOrderingServiceCAAdmin' and mspid 'osmsp' exists
    And the wallet 'SaaSOpsToolsWallet' with identity 'SaaSOrderingServiceMSPAdmin' and mspid 'osmsp' exists
    And the wallet 'SaaSOpsToolsWallet' with identity 'SaaSOrg1MSPAdmin' and mspid 'org1msp' exists
    And I have edited filters and imported all nodes to environment 'mySaaSOpsToolsFabric'
    And the 'SaaS' opstools environment is setup
    And the 'mySaaSOpsToolsFabric' environment is connected
    When I hide the node 'Org1 CA'
    Then there shouldn't be a tree item with a label 'Org1 CA' in the 'Fabric Environments' panel
    And the log should have been called with 'SUCCESS' and 'Successfully hid node Org1 CA'

  @otherFabric
  Scenario Outline: It should setup environment
    Given an environment 'myFabric' exists
    And the wallet 'myWallet' with identity 'conga' and mspid 'Org1MSP' exists
    When I connect to the environment 'myFabric'
    Then there should be a tree item with a label '<label>' in the 'Fabric Environments' panel
    And the tree item should have a tooltip equal to '<tooltip>'
    Examples:
      | label                              | tooltip                            |
      | Setting up: myFabric               | Setting up: myFabric               |
      | (Click each node to perform setup) | (Click each node to perform setup) |
      | ca.example.com   ⚠                 | ca.example.com                     |
      | orderer.example.com   ⚠            | orderer.example.com                |
      | peer0.org1.example.com   ⚠         | peer0.org1.example.com             |

  @otherFabric
  Scenario Outline: It should associate nodes with identities
    Given an environment 'myFabric' exists
    And the wallet 'myWallet' with identity 'conga' and mspid 'Org1MSP' exists
    And the 'myFabric' environment is connected
    When I associate identity '<identity>' in wallet '<wallet>' with node '<name>'
    Then the log should have been called with 'SUCCESS' and 'Successfully associated identity <identity> from wallet <wallet> with node <name>'
    Examples:
      | name                   | wallet   | identity |
      | peer0.org1.example.com | myWallet | conga    |
      | orderer.example.com    | myWallet | conga    |
      | ca.example.com         | myWallet | conga2   |

  @otherFabric
  Scenario Outline: It should connect to an environment
    Given an environment 'myFabric' exists
    And the wallet 'myWallet' with identity 'conga' and mspid 'Org1MSP' exists
    And the environment is setup
    When I connect to the environment 'myFabric'
    Then there should be a <treeItem> tree item with a label '<label>' in the 'Fabric Environments' panel
    And the tree item should have a tooltip equal to '<tooltip>'
    Examples:
      | treeItem              | label                              | tooltip                                                                      |
      | environment connected | Connected to environment: myFabric | Connected to environment: myFabric                                           |
      | channel               | mychannel                          | Associated peers: peer0.org1.example.com\\nChannel capabilities: V2_0                                      |
      | Node                  | peer0.org1.example.com             | Name: peer0.org1.example.com\\nMSPID: Org1MSP\\nAssociated Identity:\\nconga |
      | Node                  | ca.example.com                     | Name: ca.example.com\\nAssociated Identity:\\nconga2                         |
      | Node                  | orderer.example.com                | Name: orderer.example.com\\nMSPID: OrdererMSP\\nAssociated Identity:\\nconga |
      | Organizations         | OrdererMSP                         | OrdererMSP                                                                   |
      | Organizations         | Org1MSP                            | Org1MSP                                                                      |

  @otherFabric
  Scenario: It should delete a node
      Given an environment 'myFabric2' exists
      And the wallet 'myWallet2' with identity 'conga' and mspid 'Org1MSP' exists
      And the environment is setup
      And the 'myFabric2' environment is connected
      When I delete node 'ca.example.com'
      Then there shouldn't be a Node tree item with a label 'ca.example.com' in the 'Fabric Environments' panel
      And there should be a Node tree item with a label 'peer0.org1.example.com' in the 'Fabric Environments' panel

  @otherFabric
  Scenario: It should delete an environment
    Given an environment 'myFabric2' exists
    When I delete an environment 'myFabric2'
    Then there shouldn't be a tree item with a label 'myFabric2' in the 'Fabric Environments' panel
