import * as k8s from '@kubernetes/client-node';
import SmeeClient from 'smee-client';
let namespacePattern;
const debugLogging = process.env['DEBUG_LOGGING'] == 'true';
if (process.env['SINGLE_NAMESPACE']) {
    namespacePattern = `/apis/stable.example.com/v1/namespaces/${process.env['SINGLE_NAMESPACE']}/smees`;
} else {
    namespacePattern = `/apis/stable.example.com/v1/smees`;
}
console.log(`Monitoring ${namespacePattern}`);
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const watch = new k8s.Watch(kc);
const clients = [];

function deleteSmee(namespace, name) {
    const key = `${namespace}-${name}`;
    if (typeof(clients[key]) !== 'undefined') {
        console.log(`Deleting smee ${namespace}.${name}`)
        oldSmee = clients[key].close();
        delete(clients[key]);
    }
}

function upsertSmee(namespace, name, spec) {
    const {
        sourceUrl,
        targetUrl
    } = spec;
    const key = `${namespace}-${name}`;
    let oldSmee = false;
    let actionDesc;
    if (typeof(clients[key]) !== 'undefined') {
        oldSmee = clients[key];
        actionDesc = "Updating smee";
    } else {
        actionDesc = "Adding smee";
    }
    console.log(`${actionDesc} ${namespace}.${name} to connect ${sourceUrl} to ${targetUrl}`)

    const smee = new SmeeClient({
        source: sourceUrl,
        target: targetUrl,
        logger: console
    })
    // theoretically could double-deliver an event during an update
    // better than dropping one though

    clients[key] = smee.start();
    if (oldSmee) {
        oldSmee.close();
    }


}
watch.watch(namespacePattern, {
        // allowWatchBookmarks: true,
    },
    (type, apiObj, watchObj) => {
        const {
            metadata,
            spec
        } = apiObj;
        const {
            namespace,
            name
        } = metadata;
        if (debugLogging) {
            console.log(type, apiObj);
        }
        if (type === 'ADDED' || type === 'MODIFIED') {
            upsertSmee(namespace, name, spec);
        } else if (type === 'DELETED') {
            deleteSmee(namespace, name);
        } else if (type === 'BOOKMARK') {
            // console.log(`bookmark: ${watchObj.metadata.resourceVersion}`);
        } else {
            console.log('unknown type: ' + type);
        }
    },
    // done callback is called if the watch terminates normally
    (err) => {
        console.log(err);
    })