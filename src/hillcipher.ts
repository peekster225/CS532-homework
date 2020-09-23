import readline from 'readline';

/**
 * Question - Used for getting user input
 * @param question The text to be sent to the user
 * @returns Promise<string> - The user's input
 */
const question = (question:string): Promise<string> => {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, (answer) => { 
            rl.close(); resolve(answer) 
        });
    })
}

const main = async(): Promise<void> => {
    const textInput: string = await question('What is the text?\n');
    const keyInput: string = await question('What is the key?\n');
    const key: number[] = keyInput.split(' ').map(number => parseInt(number));
    if(key.length !== 4 || key.includes(NaN))
        return console.log('Key must be 4 numbers')

    const encryption = hill(textInput, key)
    const decryption = hill(textInput, createInverseKey(key))
    console.table({encryption, decryption})
}

const createInverseKey = (key: number[]) => {
    //To make inverse matrix, swap a and d, negate b and c, divide everything by determinant (ad-bc)
    const d = key[0],
        b = -key[1],
        c = -key[2],
        a = key[3];
    let det = (a*d) - (b*c)
    //get bezout coefficients from extended euclidean algorithm
    let {coeffs} = gcdExtended(det, 26)

    //pass bezout coefficient's u value to determine the inverse modulus
    let inverseMod = modInverse(coeffs.u, 26)

    let inverseKey = [];
    //Push keys to array and return. Each key should be multiplied by the modular inverse and then made positive.
    inverseKey.push(((((a * inverseMod) % 26) + 26 ) % 26),
    ((((b * inverseMod) % 26) + 26 ) % 26),
    ((((c * inverseMod) % 26) + 26 ) % 26),
    ((((d * inverseMod) % 26) + 26 ) % 26));    

    return inverseKey;
}

const hill = (message: string, key: number[]) => {

    const UPPERCASE_UNICODE_VALUE = 65;
    const LOWERCASE_UNICODE_VALUE = 97;

    //construct matrix used for encryption
    const a = key[0],
        b = key[1], 
        c = key[2], 
        d = key[3];

    //remove whitespace with regex, / / - Regular expression matching spaces, g - global flag to find all matches, replace with ''
    message = message.replace(/ /g, '');
    //add z if message length is odd
    if(message.length % 2 !== 0)
        message += 'z';
        
    // 2D array used to store the characters (converted to numbers) from the user's message.
    let initialColumns: number [][] = [];
    message.toLowerCase().match(/.{2}/g).map(chars => {
        //remove unicode padding and push value between 0 - 25
        initialColumns.push([
            (chars[0].charCodeAt(0) - LOWERCASE_UNICODE_VALUE), 
            (chars[1].charCodeAt(0) - LOWERCASE_UNICODE_VALUE)
        ]);

    })

    // 2D array used to store resultant values of matrix multiplication
    let resultantColumns: string [][] = [];
    initialColumns.map(column => {
        let x = column[0],
            y = column[1],
            topResult = 0,
            bottomResult = 0;
        //Use matrix multiplication, then use modulo operation to find new value for both elements in column
        topResult = (((a*x) + (b*y)) + 26) % 26;
        bottomResult = (((c*x) + (d*y)) + 26) % 26;
        //Add unicode padding back to number and reformat to characters
        resultantColumns.push([
            String.fromCharCode(topResult + UPPERCASE_UNICODE_VALUE),
            String.fromCharCode(bottomResult + UPPERCASE_UNICODE_VALUE)
        ])
    })

    let resultString: string = '';
    resultantColumns.map(column => {
        //Append letters to the resultant string, finishing the encryption or decryption
        resultString += column[0] + column[1];
    })
    
    return resultString;

}

//Finds the modulus inverse
const gcdExtended = (a:number, b: number) => {
    let tempRemainder,
        oldRemainder = a,
        remainder = b,
        tempS,
        oldS = 1,
        s = 0,
        tempT,
        oldT = 0,
        t = 1,
        quotient;

        while(remainder !== 0) {
            quotient = Math.floor(oldRemainder / remainder);

            tempRemainder = remainder; //Store into memory
            remainder = oldRemainder - (quotient * tempRemainder); //compute new remainder
            oldRemainder = tempRemainder;

            tempS = s; //Store into memory
            s = oldS - (quotient * tempS); //compute new s
            oldS = tempS; 

            tempT = t; //Store into memory
            t = oldT - (quotient * tempT); //compute new t
            oldT = tempT; 

        }

        // Bezout coeff's: u = oldS, v = oldT
        // gcd = oldRemainder
        // original values = a, b
        return {
            coeffs : {u: oldS, v: oldT},
            gcd: oldRemainder,
            values: {a: a, b: b}
        };
}



const modInverse = (a: number, m: number) => {
    // Compute new modulus, account for any negative numbers
    // A = number, M = modulus value
    return (a % m + m) %m;
}

main();