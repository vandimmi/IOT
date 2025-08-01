import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  generateReply(message: string): string {
    const text = message.toLowerCase();

    if (text.includes('hello') || text.includes('hi')) {
      return 'Hello! How can I help you today?';
    }

    if (text.includes('bye')) {
      return 'Goodbye! Have a great day!';
    }

    if (text.includes('help')) {
      return 'Sure, I can help. Ask me a question!';
    } 

    if (text.includes('how are you')) {
      return 'I\'m doing great!';
    }

    return "I'm not sure how to respond to that.";
  }
}
