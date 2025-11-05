#Code for self-finetuned chatbot
import re
import json
import requests
from django.conf import settings
from typing import List, Dict
import json

class AIService:
    def __init__(self):
        self.base_url = "http://localhost:11434/api/chat"
        self.model_name = "pracare"  # Your self-finetuned Ollama model
        self.system_prompt = """
        Since this is conversation give short response
        You are Pracare, a compassionate and professional mental health chat assistant. 
        Your role is to provide empathetic, supportive responses to users seeking mental health guidance.
        
        Guidelines:
        - Always be empathetic, non-judgmental, and supportive
        - Provide practical coping strategies and techniques
        - Encourage professional help when appropriate
        - Never diagnose or provide medical advice
        - Keep responses concise but thorough
        - Ask follow-up questions to better understand the user's situation
        - Maintain confidentiality and respect privacy
        
        Remember: You are not a replacement for professional therapy or medical treatment.
        """
    
    def get_ai_response(self, messages: List[Dict[str, str]]) -> str:
        """Generate a response from the local Ollama model."""
        try:
            # Prepare messages for Ollama
            formatted_messages = [{"role": "system", "content": self.system_prompt}]
            for msg in messages[-10:]:
                role = "user" if msg['message_type'] == 'user' else "assistant"
                formatted_messages.append({
                    "role": role,
                    "content": msg['content']
                })

            payload = {
                "model": self.model_name,
                "messages": formatted_messages,
                "max_tokens": 500,
                "temperature": 0.7,
                "stream": False
            }

            response = requests.post(self.base_url, json=payload)
            response.raise_for_status()
            data = response.json()
            print(data)
            return data.get("message", {}).get("content", "No response from model.").strip()


        except Exception as e:
            print("OpenAI API error:", e)
            return f"API error: {str(e)}"
            # return (
            #     "I apologize, but I'm experiencing technical difficulties. "
            #     "Please try again in a moment, or consider reaching out to a mental health professional if you need immediate support."
            # )

    def analyze_chat_patterns(self, messages: List[Dict[str, str]]) -> Dict:
        """Analyze chat patterns via local Ollama model."""
        try:
            user_messages = [msg['content'] for msg in messages if msg['message_type'] == 'user']
            if not user_messages:
                return {"error": "No user messages to analyze"}

            analysis_prompt = f"""
            As a mental health professional, analyze the following conversation messages and provide insights:
            
            Messages: {' | '.join(user_messages[-20:])}
            
            Provide analysis in the following JSON format:
            {{
                "mood_indicators": ["list of detected moods"],
                "key_concerns": ["list of main concerns"],
                "coping_mechanisms": ["observed coping strategies"],
                "risk_factors": ["any concerning patterns"],
                "recommendations": ["professional recommendations"],
                "session_summary": "brief summary of the session"
            }}
            """

            payload = {
                "model": self.model_name,
                "messages": [{"role": "user", "content": analysis_prompt}],
                "max_tokens": 800,
                "temperature": 0.3,
                "stream": False
            }

            response = requests.post(self.base_url, json=payload)
            response.raise_for_status()
            data = response.json()

            raw_text = data.get("message", {}).get("content", "")
            # print(raw_text)
            try:
                # return json.loads(raw_text)
                match = re.search(r'\{.*\}', raw_text, re.DOTALL)
                json_string = match.group(0)
                # print(json_string)
                return json.loads(json_string)
            except json.JSONDecodeError:
                return {
                    "mood_indicators": ["Unable to parse"],
                    "key_concerns": ["Analysis error"],
                    "session_summary": raw_text
                }

        except Exception as e:
            return {"error": f"Analysis failed: {str(e)}"}


# below code is for openAI and OpenRouter based chatbot services

# from openai import OpenAI
# from django.conf import settings
# from typing import List, Dict

# # openai.api_key = settings.OPENAI_API_KEY
# # openai.api_key = settings.OPENROUTER_API_KEY
# # client = Openrouter(api_key=settings.OPENROUTER_API_KEY)

# class AIService:
#     def __init__(self):
#         self.client = OpenAI(
#             base_url="https://openrouter.ai/api/v1",
#             api_key= settings.OPENROUTER_API_KEY,
#         )
#         self.system_prompt = """
#         You are Pracare, a compassionate and professional mental health chat assistant. 
#         Your role is to provide empathetic, supportive responses to users seeking mental health guidance.
        
#         Guidelines:
#         - Always be empathetic, non-judgmental, and supportive
#         - Provide practical coping strategies and techniques
#         - Encourage professional help when appropriate
#         - Never diagnose or provide medical advice
#         - Keep responses concise but thorough
#         - Ask follow-up questions to better understand the user's situation
#         - Maintain confidentiality and respect privacy
        
#         Remember: You are not a replacement for professional therapy or medical treatment.
#         """
    
#     def get_ai_response(self, messages: List[Dict[str, str]]) -> str:
#         try:
#             formatted_messages = [{"role": "system", "content": self.system_prompt}]
            
#             for msg in messages[-10:]:  # Keep last 10 messages for context
#                 role = "user" if msg['message_type'] == 'user' else "assistant"
#                 formatted_messages.append({
#                     "role": role,
#                     "content": msg['content']
#                 })
            
#             # response = openai.ChatCompletion.create(
#             #     model="gpt-3.5-turbo",
#             #     messages=formatted_messages,
#             #     max_tokens=500,
#             #     temperature=0.7,
#             # )
            
#             response = self.client.chat.completions.create(
#                 model="openai/gpt-3.5-turbo",   # you can also use gpt-4o, qwen, mistral, etc.
#                 messages=formatted_messages,
#                 max_tokens=500,
#                 temperature=0.7,
#                 extra_headers={
#                     "HTTP-Referer": "http://localhost:8000",
#                     "X-Title": "Pracare",
#                 },
#             )

#             return response.choices[0].message.content.strip()
        
#         except Exception as e:
#             return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or consider reaching out to a mental health professional if you need immediate support."
            
#             #For Debugging
#             # import traceback
#             # print("OpenAI API error:", e)
#             # traceback.print_exc()
#             # return f"API error: {str(e)}"

    
#     def analyze_chat_patterns(self, messages: List[Dict[str, str]]) -> Dict:
#         """Analyze chat patterns for professional report generation"""
#         try:
#             user_messages = [msg['content'] for msg in messages if msg['message_type'] == 'user']
            
#             if not user_messages:
#                 return {"error": "No user messages to analyze"}
            
#             analysis_prompt = f"""
#             As a mental health professional, analyze the following conversation messages and provide insights:
            
#             Messages: {' | '.join(user_messages[-20:])}
            
#             Provide analysis in the following JSON format:
#             {{
#                 "mood_indicators": ["list of detected moods"],
#                 "key_concerns": ["list of main concerns"],
#                 "coping_mechanisms": ["observed coping strategies"],
#                 "risk_factors": ["any concerning patterns"],
#                 "recommendations": ["professional recommendations"],
#                 "session_summary": "brief summary of the session"
#             }}
#             """
            
#             response = self.client.chat.completions.create(
#                 model="openai/gpt-3.5-turbo",   # you can also use gpt-4o, qwen, mistral, etc.
#                 messages=[{"role": "user", "content": analysis_prompt}],
#                 max_tokens=800,
#                 temperature=0.3,
#                 extra_headers={
#                     "HTTP-Referer": "http://localhost:8000",
#                     "X-Title": "Pracare",
#                 },
#             )
            
#             import json
#             try:
#                 analysis = json.loads(response.choices[0].message.content)
#                 return analysis
#             except json.JSONDecodeError:
#                 return {
#                     "mood_indicators": ["Unable to parse"],
#                     "key_concerns": ["Analysis error"],
#                     "session_summary": response.choices[0].message.content
#                 }
        
#         except Exception as e:
#             return {"error": f"Analysis failed: {str(e)}"}
