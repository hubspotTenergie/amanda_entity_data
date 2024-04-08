import React, {useEffect, useState} from "react";
import {Alert, Flex, hubspot, Link, List, LoadingSpinner, Text,} from "@hubspot/ui-extensions";

// Define the extension to be run within the Hubspot CRM
hubspot.extend(({context, runServerlessFunction, actions}) => (<Extension
        context={context}
        runServerless={runServerlessFunction}
        fetchProperties={actions.fetchCrmObjectProperties}
    />));

const entityStatus = [
    '',
    'En développement sans tarif d\'achat',
    'En exploitation',
    'En construction',
    'En développement avec tarif d\'achat',
    'En prospection',
    'En développement commercial',
    'En préparation de construction',
];

const dealStageEnum = {
    DEAL_STAGE_R3: '505416952', // ID de : Promesse de bail signée
    DEAL_STAGE_R2: '505416940', // ID de : RDV commercial effectué
};

// Define the Extension component, taking in runServerless, context, & sendAlert as props
const Extension = ({context, runServerless, fetchProperties}) => {
    const [loading, setLoading] = useState(true);
    const [amandaData, setAmandaData] = useState('');
    const [message, setMessage] = useState('');
    const [amandaProjectLink, setAmandaProjectLink] = useState('#');

    useEffect(() => {
        setLoading(true);
        fetchProperties('*')
            .then(properties => {
                console.log(properties)
                if (properties.id_amanda) {
                    setAmandaProjectLink(`https://prospection.tenergie.fr/?id=14&entityID=${properties.id_amanda}&entity=0&view=5201`)
                    setAmandaData({
                        title: "Informations du projet associé dans Amanda",
                        message: [{'ID Amanda : ': properties.id_amanda,}, {'Etat : ': entityStatus[properties.etat]}, {'Projet abandonné : ': properties.projet_abandonne !== "false" ? 'Oui' : 'Non'}, {
                            'Projet en stand-by : ': properties.projet_en_stand_by !== "false"  ? 'Oui' : 'Non'
                        }],
                        variant: 'info'
                    })
                }
                if(properties.dealstage !== dealStageEnum.DEAL_STAGE_R3) {
                    setMessage({
                        title: `Les informations ne sont pas encore disponible :`,
                        message: 'Elles le seront lorsque la transaction sera dans la phase " R3 : Promesse de bail signée par le bailleur."',
                        variant: 'info'
                    })
                }
            }).finally(() => {
            setLoading(false);
        });
    }, [fetchProperties])

    if (loading) {
        return <Flex
            direction={'row'}
            justify={'center'}
            wrap={'wrap'}
            gap={'small'}
        > <LoadingSpinner/></Flex>
    }
    if (message) {
        return (<Flex
            direction={'row'}
            justify={'center'}
            wrap={'wrap'}
            gap={'small'}
        >
            <Alert title={message.title} variant={message.variant}>
                {message.message}
            </Alert>
        </Flex>);
    }

    return (<Flex
        direction={'column'}
        justify={'center'}
        wrap={'wrap'}
        gap={'small'}
    ><Flex direction={'column'}
           justify={'center'}
           wrap={'wrap'}
           gap={'small'}>
        <Text>
            {amandaData.message.map((m, index) => {
                return(
                    <Flex direction={'row'}
                          justify={'start'}
                          wrap={'wrap'}
                          gap={'small'} >
                        <Text format={{fontWeight:'bold'}}>
                            - {Object.keys(m)}
                        </Text>
                        <Text >
                            {Object.values(m)}
                        </Text>
                    </Flex>)
            })}
        </Text>
    </Flex>
        <Flex direction={'row'}
              justify={'center'}
              wrap={'wrap'}
              gap={'small'}>
            {amandaProjectLink !== '#' && <Link target='_blank' href={amandaProjectLink}>Vue Amanda</Link>}
        </Flex>

    </Flex>);
};
