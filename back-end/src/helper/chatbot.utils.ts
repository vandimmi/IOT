const blind_replies = [
	"Please try something more descriptive.",
	"Oh! It appears you wrote something I don't understand yet.",
	"Do you mind trying to rephrase that?",
	"I'm terribly sorry, I didn't quite catch that.",
	"I can't answer that yet, please try asking something else."
];

const response_patterns = [
	{
    "response_type": "greeting",
    "user_input": ["hello", "hi", "hey"],
    "bot_response": "Hey there!",
    "required_words": []
  },
  {
    "response_type": "greeting",
    "user_input": ["see you", "goodbye", "bye"],
    "bot_response": "See you later!",
    "required_words": []
  },
  {
    "response_type": "greeting",
    "user_input": ["nice", "to", "meet", "you"],
    "bot_response": "The pleasure is all mine!",
    "required_words": ["nice", "meet", "you"]
  },
  {
    "response_type": "question",
    "user_input": ["how", "to", "learn", "code", "coding", "apps"],
    "bot_response": "Start by typing: 'How to learn coding' on Google.",
    "required_words": ["learn", "code"]
  },
  {
    "response_type": "question",
    "user_input": ["refund", "how", "can", "I", "get"],
    "bot_response": "We don't offer refunds for free education.",
    "required_words": ["refund", "i"]
  },
  {
    "response_type": "question",
    "user_input": ["how", "are", "you"],
    "bot_response": "I'm great! Thanks for asking.",
    "required_words": ["how", "are", "you"]
  }
]

function blindResponse() {
	let rand_idx = Math.floor(Math.random() * blind_replies.length);
	return blind_replies[rand_idx];
}

export function generateResponse(input: string) {
	const words = input.toLowerCase().split(/\s+|[,;?!.-]\s*/);

	let response_rank: number[] = [];

	for (let pattern of response_patterns) {
		let score = 0;
		let requirement_check = true;

		for (let required_word of pattern["required_words"]) {
			requirement_check &&= words.includes(required_word);
		}

		if (requirement_check) {
			for (let word of words) {
				if (pattern["user_input"].includes(word))
					score++;
			}
		}

		response_rank.push(score);
	}

	let best_response_idx = 0;
	for (let i = 0; i < response_rank.length; i++) {
		if (response_rank[i] > response_rank[best_response_idx])
			best_response_idx = i;
	}

	if (response_rank[best_response_idx] > 0) {
		return response_patterns[best_response_idx]["bot_response"];
	}
	
	return blindResponse();
}