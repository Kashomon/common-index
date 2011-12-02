/*
 * Peg grammar for SGF files 
 */
Start = '(;' tokens:Tokens pmoves:Variations ')' { 
  return { data: tokens, moves: pmoves }; 
} 

Variations =  '(' var1:Moves ')' '\n'? '(' var2:Moves ')' '\n'? more:MoreVars { return [var1, var2].concat(more); }
           /  move:Moves { return (move === undefined ? [] : [move]); } 

MoreVars = '(' move:Moves ')' '\n'? more:MoreVars { return [move].concat(more); }
         / '' { return []; } 

Moves = ';' tokens:Tokens variations:Variations { 
          return { data: tokens, moves: variations }; 
        } 
      / '' { return undefined; } 

Tokens = token: TokenName '[' data: Data ']' '\n'? more:MoreData '\n'? tokens:MoreTokens {
  tokens[token] = [data].concat(more); 
  return tokens;
}   

MoreTokens = Tokens 
           / '' { return {}; }

Data = data:(( '\\]' / [^\]] )+) { return data.join(""); }

MoreData = '[' data: Data ']' '\n'? more: MoreData { return [data].concat(more); }
         / '' { return []; } 

TokenName = name:([a-zA-Z] [a-zA-Z] / [a-zA-Z]) { 
  if (name.length === 1) return name[0];
  else return name.join("").toUpperCase();
} 
