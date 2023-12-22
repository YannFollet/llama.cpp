#!/bin/bash

# Adjust to the number of CPU cores you want to use.
N_THREAD="$1"
TEMP="$2"
FINALPROMPT="$3"

MODEL="./models/mistral-7b-instruct-v0.2.Q8_0.gguf"
NGL=99


# Number of tokens to predict (made it larger than default because we want a long interaction)
N_PREDICTS="${N_PREDICTS:-8192}"

# Note: you can also override the generation options by specifying them on the command line:
GEN_OPTIONS="${GEN_OPTIONS:---ctx_size 8192 --top_k 40 --top_p 0.5 --repeat_last_n 256 --batch_size 1024 --repeat_penalty 1.17647}"

# shellcheck disable=SC2086 # Intended splitting of GEN_OPTIONS
#  --log-disable \
#  --verbose-prompt \
#  --seed -1 \
#  --no-display-prompt \
./main $GEN_OPTIONS \
  --no-display-prompt \
  --model "$MODEL" \
  --seed 123 \
  --color \
  --n_predict "$N_PREDICTS" \
  --threads "$N_THREAD" \
  --temp $TEMP \
  -ngl $NGL \
  -p "[INST]You are a helpful and efficient assistant. You have been programmed to process and respond to various types of tasks given to you by users.
  Your goal is to understand the context of each task and provide accurate, relevant, and clear responses or instructions based on that understanding.
  Please pay close attention to the details provided in the user's message and do your best to assist them efficiently and effectively.
  The transcript only includes text, it does not include markup like HTML and Markdown. The following is the user message :
  $FINALPROMPT[/INST]
" 2>/dev/null
