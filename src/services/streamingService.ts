const AI_SERVICE_URL =
  import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';

export interface StreamEvent {
  type:
    | 'basic_info'
    | 'ingredients_separated'
    | 'harmful_descriptions'
    | 'safe_descriptions'
    | 'packaging_analysis'
    | 'complete'
    | 'error';
  data: any;
}

export interface StreamCallbacks {
  onBasicInfo?: (data: any) => void;
  onIngredientsSeparated?: (data: any) => void;
  onHarmfulDescriptions?: (data: any) => void;
  onSafeDescriptions?: (data: any) => void;
  onPackagingAnalysis?: (data: any) => void;
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Stream barcode lookup results progressively using Server-Sent Events
 */
export const streamBarcodeAnalysis = async (
  barcode: string,
  callbacks: StreamCallbacks
): Promise<void> => {
  try {
    // Use GET request for SSE (better streaming support)
    const response = await fetch(
      `${AI_SERVICE_URL}/lookup-barcode-stream?barcode=${encodeURIComponent(
        barcode
      )}`,
      {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body reader available');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('Stream complete');
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages (separated by double newlines)
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep incomplete event in buffer

      for (const event of events) {
        if (event.trim().startsWith('data:')) {
          const jsonStr = event.trim().replace(/^data:\s*/, '');

          try {
            const parsedEvent: StreamEvent = JSON.parse(jsonStr);

            // Route to appropriate callback
            switch (parsedEvent.type) {
              case 'basic_info':
                callbacks.onBasicInfo?.(parsedEvent.data);
                break;
              case 'ingredients_separated':
                callbacks.onIngredientsSeparated?.(parsedEvent.data);
                break;
              case 'harmful_descriptions':
                callbacks.onHarmfulDescriptions?.(parsedEvent.data);
                break;
              case 'safe_descriptions':
                callbacks.onSafeDescriptions?.(parsedEvent.data);
                break;
              case 'packaging_analysis':
                callbacks.onPackagingAnalysis?.(parsedEvent.data);
                break;
              case 'complete':
                callbacks.onComplete?.(parsedEvent.data);
                break;
              case 'error':
                callbacks.onError?.(parsedEvent.data.message);
                break;
            }
          } catch (parseError) {
            console.error('Failed to parse SSE message:', parseError, jsonStr);
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    callbacks.onError?.(
      error instanceof Error ? error.message : 'Unknown streaming error'
    );
  }
};
