// Icons component replacements
const ChevronLeft = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
  
  const ChevronRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
  
  const RotateCw = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6"/>
      <path d="M21 13a9 9 0 1 1-3-7.7L21 8"/>
    </svg>
  );
  
  // Main FlashcardApp component
  function FlashcardApp() {
    const [cards, setCards] = React.useState([]);
    const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Get the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(worksheet, { header: ['english', 'turkish', 'sentence'] });
        
        // Skip header row if it exists (check if first row contains column names)
        const startIndex = 
          data.length > 0 && 
          typeof data[0].english === 'string' && 
          (data[0].english.toLowerCase() === 'eng' || 
           data[0].english.toLowerCase() === 'english') ? 1 : 0;
        
        const processedCards = data.slice(startIndex).map(row => ({
          english: row.english || '',
          turkish: row.turkish || '',
          sentence: row.sentence || ''
        }));
        
        if (processedCards.length === 0) {
          setError('No valid data found in the file.');
        } else {
          setCards(processedCards);
          setCurrentCardIndex(0);
          setIsFlipped(false);
        }
      } catch (err) {
        setError('Error processing file. Please ensure it\'s a valid Excel file with the correct format.');
        console.error('Error processing file:', err);
      }
      
      setIsLoading(false);
    };
    
    const flipCard = () => {
      setIsFlipped(!isFlipped);
    };
    
    const nextCard = () => {
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      }
    };
    
    const prevCard = () => {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
        setIsFlipped(false);
      }
    };
    
    const resetCards = () => {
      setCurrentCardIndex(0);
      setIsFlipped(false);
    };
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Flashcards</h1>
        
        {/* File Upload */}
        <div className="mb-8 w-full max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Excel File (columns: front, back, note)
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {isLoading && <p className="mt-2 text-sm text-gray-500">Loading...</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        
        {/* Flashcard */}
        {cards.length > 0 && (
          <div className="w-full max-w-md mb-6">
            <div 
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform cursor-pointer"
              style={{ 
                height: '280px',
                perspective: '1000px',
              }}
              onClick={flipCard}
            >
              <div 
                className="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front of card (English) */}
                <div
                  className="absolute w-full h-full flex flex-col items-center justify-center p-6 backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-3xl font-bold text-center text-gray-800">
                    {cards[currentCardIndex].english}
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    (Click to flip)
                  </div>
                </div>
                
                {/* Back of card (Turkish + Sentence) */}
                <div
                  className="absolute w-full h-full flex flex-col items-center justify-center p-6 backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="text-2xl font-bold text-center text-gray-800 mb-4">
                    {cards[currentCardIndex].turkish}
                  </div>
                  <div className="text-sm italic text-gray-600 text-center">
                    {cards[currentCardIndex].sentence}
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    (Click to flip back)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card navigation */}
            <div className="flex items-center justify-between mt-4">
              <button 
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="flex items-center py-2 px-4 bg-white rounded-md shadow text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft /> Prev
              </button>
              
              <div className="text-gray-700">
                {currentCardIndex + 1} / {cards.length}
              </div>
              
              <button 
                onClick={nextCard}
                disabled={currentCardIndex === cards.length - 1}
                className="flex items-center py-2 px-4 bg-white rounded-md shadow text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight />
              </button>
            </div>
            
            {/* Reset button */}
            <div className="flex justify-center mt-4">
              <button 
                onClick={resetCards}
                className="flex items-center py-2 px-4 bg-white rounded-md shadow text-gray-700"
              >
                <RotateCw /> Reset
              </button>
            </div>
          </div>
        )}
        
        {cards.length === 0 && !isLoading && !error && (
          <div className="text-gray-600 text-center p-6 bg-white rounded-lg shadow-md">
            <p>Upload an Excel file to start practicing flashcards.</p>
            <p className="text-sm mt-2">Your file should have three columns: fron, back, and note.</p>
          </div>
        )}
      </div>
    );
  }
  
  // Render the app
  ReactDOM.render(<FlashcardApp />, document.getElementById('root'));