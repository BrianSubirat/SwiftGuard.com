export function openInspectFeature(targetDocument) {
    // Simulate browser inspector
    try {
        const selectedElements = targetDocument.querySelectorAll('*');
        console.group('Inspection Results');
        selectedElements.forEach((el, index) => {
            console.log(`Element ${index + 1}:`, {
                tagName: el.tagName,
                classes: el.classList.toString(),
                id: el.id,
                computedStyle: window.getComputedStyle(el)
            });
        });
        console.groupEnd();
        
        alert('Detailed inspection logged to browser console.');
    } catch (error) {
        console.error('Inspection failed:', error);
        alert('Unable to inspect the page.');
    }
}

export function readAloudText(targetDocument) {
    try {
        // Extract main text content
        const textContent = targetDocument.body.innerText;
        
        // Check if browser supports speech synthesis
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textContent);
            
            // Optional: Configure speech properties
            utterance.rate = 1.0;  // Speed of speech
            utterance.pitch = 1.0; // Pitch of speech
            
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in this browser.');
        }
    } catch (error) {
        console.error('Read Aloud failed:', error);
        alert('Unable to read page content.');
    }
}

export function printCurrentPage() {
    try {
        window.print();
    } catch (error) {
        console.error('Print failed:', error);
        alert('Unable to print the page.');
    }
}