// 🧠 Logic Test
// Create a function processWithDelay that demonstrates understanding of modern async
// patterns.

// Core Functionality
// The function should process each number in the array with a 1-second delay between 
// each number. The function should print each number to the console when it is
// processed.
// The function should return a Promise that resolves when all numbers have been
// processed.
// The function should handle empty arrays gracefully and return a resolved Promise
// immediately.
// The function should also handle invalid inputs (e.g., non-array, non-numeric values) by
// throwing a custom error.

// Bonus Points ✨
// Allow configurable delay time
// Support cancellation of the ongoing process
// Implement progress tracking

class ProcessCustomError extends Error {
    constructor(message : string){
        super(message);
        this.name = "ProcessCustomError!"
    }
} 

async function processWithDelay(
    numbers: number[] , 
    delayMs: number = 1000,
    abortSignal?: AbortSignal,
): Promise<void> {

    if(!Array.isArray(numbers)) {
        throw new ProcessCustomError('Input must be array!');
    }

    for(const num of numbers){
        if(typeof num !== 'number' || isNaN(num)){
            throw new ProcessCustomError('All array must be a number!');
        }
    }

    if(numbers.length === 0 ){
        throw new ProcessCustomError('Array cannot be empty!');
    }

    const total = numbers.length;
    let processed = 0;

    for (const num of numbers) {
        if (abortSignal?.aborted) {
            throw new ProcessCustomError('Processing was aborted');
        }

        await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, delayMs);
            
            abortSignal?.addEventListener('abort', () => {
                clearTimeout(timeoutId);
                reject(new ProcessCustomError('Processing was aborted'));
            });
        });
        console.log(num);
        processed++; 
        console.log(`Progress: ${Math.round(processed / total * 100)}%`);
    }
}

// Test
(async () => {
    try {
        console.log("Test case 1: Normal array");
        await processWithDelay([1, 2, 3, 4, 5] , 500);
    } catch (error) {
        if (error instanceof ProcessCustomError) {
            console.error("Caught error:", error.message);
        }
    }

    try {
        console.log("\nTest case 2: Empty array");
        await processWithDelay([]);
    } catch (error) {
        if (error instanceof ProcessCustomError) {
            console.error("Caught error:", error.message);
        }
    }

    try {
        console.log("\nTest case 3: Invalid input (non-array)");
        await processWithDelay("not an array" as any);
    } catch (error) {
        if (error instanceof ProcessCustomError) {
            console.error("Caught error:", error.message);
        }
    }

    try {
        console.log("\nTest case 4: Array with non-number");
        await processWithDelay([1, "2", 3] as any);
    } catch (error) {
        if (error instanceof ProcessCustomError) {
            console.error("Caught error:", error.message);
        }
    }

    try {
        console.log("\nTest case 5: With abort signal");
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3500); 
        await processWithDelay([1, 2, 3, 4, 5], 1000, controller.signal);
    } catch (error) {
        if (error instanceof ProcessCustomError) {
            console.error("Caught error:", error.message);
        }
    }

})();