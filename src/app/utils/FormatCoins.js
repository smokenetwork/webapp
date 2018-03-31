import {
    CURRENCY_SIGN,
    DEBT_TOKEN_SHORT,
    LIQUID_TOKEN,
    LIQUID_TOKEN_UPPERCASE,
    VESTING_TOKEN
} from '../client_config';

// TODO add comments and explanations
// TODO change name to formatCoinTypes?
// TODO make use of DEBT_TICKER etc defined in config/clietn_config
export function formatCoins(string) {
	// return null or undefined if string is not provided
	if(!string) return string
	// TODO use .to:owerCase() ? for string normalisation
	string = string.replace('SBD', DEBT_TOKEN_SHORT ).replace('SD', DEBT_TOKEN_SHORT)
		  		   .replace('Smoke Power', VESTING_TOKEN).replace('SMOKE POWER', VESTING_TOKEN)
		    	   .replace('Smoke', LIQUID_TOKEN).replace('SMOKE', LIQUID_TOKEN_UPPERCASE)
				   .replace('$', CURRENCY_SIGN)
	return string
}
