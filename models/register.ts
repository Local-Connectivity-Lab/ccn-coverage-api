const encoder = new TextEncoder();  // UTF-8 is the charset we will be using for the bytes
const decoder = new TextDecoder();

interface IRegisterRequest {
    publicKey: string  // in hex
    message: Buffer
    sigMessage: Buffer
}

interface IRegisterMessage {
    publicKey: string   // in hex
    identity: string    // in hex
    attestation: string // in hex
}


class AuthenticationMessage {
    publicKey: string
    identity: string
    attestation: string
    constructor(BufferbytesFromJava:  any) {
        // 1. Convert the byte stream into a UInt8Array i.e. each byte represented as 8 bits
        let buffer = new Uint8Array(BufferbytesFromJava);
        // 2. Use the UTF-8 Text decoder on the buffer to obtain the serialized contents from Java
        let serializedContents = decoder.decode(buffer);
        // 3. Let Java encode the messages exposing Java struct as JSON.
        let contents:IRegisterMessage = JSON.parse(serializedContents);
        // 4. Parse the fields correctly to match the Java class
        this.publicKey = contents['publicKey'];
        this.identity = contents['identity'];
        this.attestation = contents['attestation'];
    }
}

export { IRegisterRequest, AuthenticationMessage }
