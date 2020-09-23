/***********************************************************************
 * Program that can encrypt and decrypt using the general Caesar Cipher.
 * Asks user for the text to be modified, and the shift value.
 * 
 * By Matt <peekster225@gmail.com>
 * September 21st, 2020.
 ***********************************************************************/


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
    const shiftInput: number = Number(await question('What is the shift?\n'));
    //If shift is not a number, return. 
    if(isNaN(shiftInput))
        return console.log('Shift must be a number.')

    const answer = caesar(textInput, shiftInput);
    console.log(answer)
}



/**
 * 
 * @param inputText The text to be modified
 * @param shift The size of the shift
 * @returns modifiedText - The modified text.
 */
const caesar = (inputText: string, shift: number):string => {

    const UPPERCASE_UNICODE_VALUE = 65;
    const LOWERCASE_UNICODE_VALUE = 97;
    // If the shift is negative, find the negative modulos and set it's equivalent positive shift.
    //Ex: a shift of -7mod26 is congruent to 19mod26
    if(shift < 0) 
        shift = ((shift % 26) + 26) % 26;
    
    //Remove any whitespace
    inputText = inputText.replace(/ /g, ''); 

    /**
     * String.fromCharCode returns a string created from the specified sequence of UTF-16 values.
     * 
     * To signify that fromCharCode's parameter is an array of numbers, we utilize the spread operator to make the text iteratable.
     * 
     * To build this sequence of code units, we start by using .split('') to create an array of substrings (each substring is a single character).
     * Next, we utilize .map() to modify each character in the array, assigning a new value based on the shift amount specified.
     * 
     * We then check the character to see if it is uppercase, and use a ternary operator to determine the modulos calculation.
     * char.charCodeAt(0) takes the first (only) character in the substring and derives the Unicode value for said character
     * Subtracting 65 from uppercase characters allows the A-Z values to range from 0-25.
     * Subtracting 97 from lowercase characters allows the a-z values to range from 0-25.
     * 
     * After getting the current characters value (0-25), we add the positive shift to the character's value, and compute modulos 26.
     * After getting the modulos of 26, we obtain the new character's value, and add Unicode's value padding back onto the character's value.
     * Adding 65 from uppercase characters allows the A-Z values to be printed from Unicode.
     * Adding 97 from uppercase characters allows the a-z values to be printed from Unicode.
     * 
     */
    const modifiedtext: string = String.fromCharCode(
        ...inputText.split('')
                    .map(char => ( 
                        ( char === char.toUpperCase() ) ? 
                            ( ( (char.charCodeAt(0) - UPPERCASE_UNICODE_VALUE + shift) % 26 ) + UPPERCASE_UNICODE_VALUE ) :
                            ( ( (char.charCodeAt(0) - LOWERCASE_UNICODE_VALUE + shift) % 26 ) + LOWERCASE_UNICODE_VALUE )
                        )
                    )
    )

    return modifiedtext;
}

main();