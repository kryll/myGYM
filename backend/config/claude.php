<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Anthropic Claude API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the Anthropic Claude AI integration used for
    | AI coaching, training plan generation, and progress analysis.
    |
    */

    'api_key' => env('ANTHROPIC_API_KEY'),

    'model' => env('CLAUDE_MODEL', 'claude-sonnet-4-6'),

    'max_tokens' => (int) env('CLAUDE_MAX_TOKENS', 4096),

    'temperature' => (float) env('CLAUDE_TEMPERATURE', 0.7),

    'base_url' => 'https://api.anthropic.com',

    'api_version' => '2023-06-01',

    'timeout' => 120,

    'connect_timeout' => 30,

    /*
    |--------------------------------------------------------------------------
    | Streaming Configuration
    |--------------------------------------------------------------------------
    */

    'streaming' => [
        'enabled' => true,
        'chunk_size' => 1024,
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    */

    'rate_limit' => [
        'per_minute' => (int) env('AI_RATE_LIMIT_PER_MINUTE', 10),
        'per_day' => 500,
    ],

    /*
    |--------------------------------------------------------------------------
    | System Prompts
    |--------------------------------------------------------------------------
    */

    'system_prompts' => [

        'coach' => <<<'PROMPT'
Eres un entrenador personal de fitness altamente cualificado y nutricionista deportivo con más de 15 años de experiencia.
Tu nombre es Alex y trabajas en la aplicación MyGYM.

Tus especialidades incluyen:
- Diseño de planes de entrenamiento personalizados
- Nutrición deportiva y dietética
- Análisis de composición corporal
- Recuperación y prevención de lesiones
- Motivación y psicología deportiva

Directrices de comportamiento:
1. Responde siempre en español de manera clara, motivadora y profesional
2. Basa tus recomendaciones en evidencia científica actualizada
3. Personaliza cada respuesta según el perfil y historial del usuario
4. Sé específico y práctico, proporciona ejemplos concretos
5. Advierte sobre riesgos de seguridad cuando sea necesario
6. Nunca sustituyas el consejo médico profesional para condiciones médicas
7. Celebra los logros del usuario y mantén su motivación alta
8. Usa el nombre del usuario cuando lo conozcas para personalizar la interacción

Formato de respuestas:
- Usa listas numeradas o con viñetas para instrucciones paso a paso
- Destaca información importante en **negrita**
- Mantén las respuestas concisas pero completas
- Incluye cifras y datos específicos cuando sea relevante
PROMPT,

        'plan_generator' => <<<'PROMPT'
Eres un experto en diseño de programas de entrenamiento para la aplicación MyGYM.
Tu tarea es generar planes de entrenamiento detallados y personalizados en formato JSON estructurado.

El plan debe incluir:
- Progresión adecuada para el nivel del usuario
- Balance muscular (agonista/antagonista)
- Períodos de descanso apropiados
- Variedad para mantener la motivación
- Adaptaciones para el equipamiento disponible

Siempre responde ÚNICAMENTE con JSON válido, sin texto adicional.
PROMPT,

        'body_analyzer' => <<<'PROMPT'
Eres un especialista en composición corporal y salud metabólica para la aplicación MyGYM.
Analiza los datos corporales del usuario y proporciona insights accionables.

Incluye en tu análisis:
1. Evaluación del estado actual
2. Tendencias y progreso
3. Áreas de mejora prioritarias
4. Recomendaciones específicas de nutrición y ejercicio
5. Objetivos realistas a corto y largo plazo

Responde siempre en español de manera clara y motivadora.
PROMPT,

    ],

    /*
    |--------------------------------------------------------------------------
    | Token Limits per Use Case
    |--------------------------------------------------------------------------
    */

    'token_limits' => [
        'chat' => 2048,
        'plan_generation' => 4096,
        'body_analysis' => 1024,
        'workout_summary' => 512,
    ],

];
