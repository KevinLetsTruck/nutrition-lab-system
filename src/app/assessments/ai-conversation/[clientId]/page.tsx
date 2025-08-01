'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, Pause, Play, ChevronLeft } from 'lucide-react';
import { AIConversationEngine } from '@/lib/ai-conversation-engine';
import { ConversationProgress } from '@/components/assessment/ConversationProgress';
import { SectionValidation } from '@/components/assessment/SectionValidation';

interface Message {
  id: string;
  role: 'ai' | 'client';
  content: string;
  timestamp: Date;
  section?: string;
  messageType?: string;
}

export default function AIConversationPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSection, setCurrentSection] = useState('introduction');
  const [showValidation, setShowValidation] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationEngine = useRef<AIConversationEngine | null>(null);

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        conversationEngine.current = new AIConversationEngine();
        const convId = await conversationEngine.current.startConversation(clientId);
        setConversationId(convId);
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: '1',
          role: 'ai',
          content: "Hi! I'm here to help you with your health assessment. This is a conversational approach where we'll discuss your health concerns in a natural, comfortable way. Let's start with how you've been feeling lately. What brings you here today?",
          timestamp: new Date(),
          section: 'introduction'
        };
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
      }
    };

    initConversation();
  }, [clientId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || isLoading || isPaused) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'client',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await conversationEngine.current?.processClientResponse(
        conversationId,
        inputValue
      );

      if (response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: response.content,
          timestamp: new Date(),
          section: response.section,
          messageType: response.messageType
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Update current section if changed
        if (response.section !== currentSection) {
          setCurrentSection(response.section);
        }

        // Show validation if needed
        if (response.messageType === 'validation') {
          setShowValidation(true);
        }
      }
    } catch (error) {
      console.error('Failed to process message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePause = async () => {
    setIsPaused(!isPaused);
    if (conversationId) {
      await conversationEngine.current?.pauseConversation(conversationId, !isPaused);
    }
  };

  const handleVoiceInput = () => {
    // Voice input implementation would go here
    setIsRecording(!isRecording);
    // This would integrate with browser's speech recognition API
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span className="font-medium">Health Assessment</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePause}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Sidebar - Desktop only */}
      <div className="hidden lg:block w-80 bg-white border-r">
        <div className="p-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Client
          </Button>
          
          <ConversationProgress
            conversationId={conversationId}
            currentSection={currentSection}
            onSectionClick={(section) => {
              // Navigate to section logic
            }}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col pt-16 lg:pt-0">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-6 bg-white border-b">
          <h1 className="text-2xl font-bold">AI Health Assessment</h1>
          <div className="flex items-center gap-4">
            <Badge variant={isPaused ? 'orange' : 'green'}>
              {isPaused ? 'Paused' : 'Active'}
            </Badge>
            <Button
              variant="outline"
              onClick={togglePause}
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'client' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] lg:max-w-[70%] rounded-lg p-4 ${
                  message.role === 'client'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className={`text-xs mt-2 block ${
                  message.role === 'client' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4 lg:p-6">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoiceInput}
              className={`lg:flex h-10 w-10 p-0 ${isRecording ? 'bg-red-100' : ''}`}
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-600' : ''}`} />
            </Button>
            
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isPaused ? "Conversation paused..." : "Type your response..."}
              disabled={isPaused || isLoading}
              className="flex-1"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || isPaused}
              size="sm"
              className="h-10 w-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Mobile hint */}
          <p className="text-xs text-gray-500 text-center mt-2 lg:hidden">
            Tip: Tap the microphone for voice input
          </p>
        </div>
      </div>

      {/* Section Validation Modal */}
      {showValidation && (
        <SectionValidation
          conversationId={conversationId!}
          section={currentSection}
          onClose={() => setShowValidation(false)}
          onValidate={async (validated) => {
            setShowValidation(false);
            if (validated) {
              // Continue to next section
              const response = await conversationEngine.current?.moveToNextSection(conversationId!);
              if (response) {
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  role: 'ai',
                  content: response.content,
                  timestamp: new Date(),
                  section: response.section
                }]);
              }
            }
          }}
        />
      )}
    </div>
  );
}