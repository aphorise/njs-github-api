var f_SysT1=Date.now()/1000; //start time for measuring init times
var bTTY = Boolean(process.stdout.isTTY); //execution in terminal?
function sRaw(msg) { return bTTY ? msg : msg.replace( /\033\[[0-9;]*m/g, "" ); } /*strip TTY ANSI colours if not in shell.*/
var sCR=""+sRaw("\033[31m"),/*Red*/ sCC=""+sRaw("\033[36m"); /*Cyan*/
var sCDG=""+sRaw("\033[90m"),/*Dark Gray*/ sCG=""+sRaw("\033[32m"); /*Green*/
var sCN=""+sRaw("\033[0m"),/*Natural*/ sCNB=""+sRaw("\033[1m"); /*Natural Bold*/
var sCP=""+sRaw("\033[35m"),/*Purple*/ sCY=""+sRaw("\033[33m"); /*Yellow*/
var sCRBG=""+sRaw("\033[41");/*Red Bg White Text*/
var sMsgErrReq=sCR+"ERROR "+sCN+"loading required: "+sCNB+"modules"+sCN+"\nDid you -> npm install <- ?";
var sL = sCNB + "\n@========================================@" + sCN; /* Line for TUI */
var sMsgWelcome = sCG + "\nSTARTED " + sCN + sCNB + "njs-github-api v0.0.2" + sCN + "@ " + new Date();
var sMsgInit = sCP + "System ININT " + sCN + sCNB + "in: " + sCG + "%s" + sCN + " seconds";

/* SHORT-HAND forms */
var UDF = undefined;
//----------------------------------------------------------------
/* Packages Required: */
//----------------------------------------------------------------
var mGITHUB;
try
{
	mGITHUB = require("github");
	module.exports = { "getGitHubRepos" : getGitHubRepos };
}
catch (e){ console.log(sMsgErrReq + "\n" + e); process.exit(1); }
//----------------------------------------------------------------
var github = new mGITHUB({ version: "3.0.0" });

var sTAG = "develop";
var sORG = "vigour-io";
var sUID = "github_user-id";	// USER-ID
var sUPS = "github_user-secret";// USER-SECRET
var sPKG = "package.json";	// FILE / package.json to check
var sPKGPATH1 = "vigour";	// specific JSON path { "vigour" : .... }
var sPKGPATH2 = "category";	// sub-specifics path { "vigour" : { "category" : "services" } }
var sPKGPATH2_VALUE = "services";  
var sUTK = "111c00c0007abcdefg123456789abcd12345efff";	//USER-TOKEN if used in place of credentials. 
var gitUsrRepos;
var gitOrgRepos;
var gitOrgDone = false;
var gitOrgPageRepo = 1;
var gitOrgRepoTotal = -1;
var gitServiceRepos = [];

function fFulfil() { console.log("TOTAL Private ORG Repo's: " + gitOrgRepos.length); }
function fReject(e){ { console.log("ERROR! a call failed:" + e); } }
var fulfill; 
var reject;

/* ===========================================================================
 * MAIN constructor like function for this module
 * @param String Branch/Tag of what should be observed (required).
 * @param String Organisation name / ID (required). 
 * @param String Token of github user (require or credentials)
 * @param String User-ID github ID used instead of token (require or token).
 * @param String User-Secret github password for ID where used instead of token (require or token).
 * @param Array to store specific package.json of matches & return on success.
 * @param Promise fulfill function to be triggered on success
 * @param Promise fulfill function to be triggered on success 
 ===========================================================================*/
function getGitHubRepos(sTag, sOrg, sUtk, sUid, sUps, oToAppend, pFulfil, pReject)
{
	sTAG=sTag; sORG=sOrg; sUTK=sUtk; sUID=sUid; sUPS=sUps; gitServiceRepos=oToAppend; 
	if (UDF===sTAG || UDF===sORG || UDF===gitServiceRepos || (UDF === sUTK && UDF === sUID && UDF===sUPS))
	{
		console.log("ERORR - INSUFFICIENT PARAMETERS! - Require:"); 
		console.log("\t\tBranch/TAG, Organisation-ID, User-ID, User-SECRET, Variable-of-REPOS");
		console.log("\t\t(OPTIONAL) Promise-Fulfil-Function, Promise-Reject-Function");
		return ;
	}
	if (UDF === sUtk) { github.authenticate({ "type": "basic", "username": sUID, password: sUPS}); } 
	else { github.authenticate({ "type": "oauth", "token": sUTK}); }
	processGitHubRepos(pFulfil, pReject);
}

/* Look for specific path in JSON of requested file (package.json). @param String git-user. @param String git-repo */
function gitCheckContent(sGitUser, sGitRepo)
{
	github.repos.getContent
	(
		{ user: sGitUser, repo: sGitRepo, path: sPKG, ref: sTAG },
		function(e, r)
		{
			--gitOrgRepoTotal;
			if (UDF === e || null === e)
			{
				var b = new Buffer(r.content, "base64");
				var s = b.toString();
				var oJson = JSON.parse(s); 
				if (UDF !== oJson[sPKGPATH1])
				{
					if (UDF !== oJson[sPKGPATH1][sPKGPATH2] && sPKGPATH2_VALUE === oJson[sPKGPATH1][sPKGPATH2])
					{
						console.log(oJson.name + " <-- HAS: .vigour.category == services - IN package.json");
						gitServiceRepos.push(oJson);
					}
				}
			}
			if (gitOrgRepoTotal === 0) { fulfill(); }
		}
	);
}

/* Callback to parse getRepo related calls. @param String error. @param String response. @param Boolean true if a user.*/
function parseRepos(e, r, bIsUser)
{
	if (null !== e){ reject(e); return ; /*console.log("ERROR call failed.", e);*/ }
	else
	{
		delete(r.meta);
		if (UDF === bIsUser || true === bIsUser)
		{ gitUsrRepos = r; console.log("TOTAL Public USER Repo's: " + r.length); }
		else
		{ 
			if (!gitOrgDone)
			{
				if (UDF === gitOrgRepos) { gitOrgRepos = r; }
				else
				{
					for (var iR = 0; iR < r.length; ++iR) { gitOrgRepos.push(r[iR]); }
					if (r.length === 0 || r.length < 100)
					{
						gitOrgDone = true;
						gitOrgRepoTotal = gitOrgRepos.length;
					}
					else
					{
						++gitOrgPageRepo;
						github.repos.getFromOrg
						(
							{per_page: "100", org: "vigour-io", type: "member", page: gitOrgPageRepo.toString()},
							function(e, r) { parseRepos(e, r, false); }
						);
					}
				}

				if (r.length === 100)
				{
					++gitOrgPageRepo;
					console.log("100 or more REPO's ... checking more.");
					github.repos.getFromOrg( {per_page: "100", org: "vigour-io", type: "member", page: "2"}, function(e, r) { parseRepos(e, r, false); } );
				}
			}
		}
	}
	
	if ( UDF !== gitOrgRepos && gitOrgDone)
	{
		for (var iX=0; iX < gitOrgRepos.length; ++iX)
		{
			gitCheckContent(gitOrgRepos[iX].owner.login, gitOrgRepos[iX].name);
		}
	}
}

/* main wrapper function. @param Promise Fulfil function. @param Promise Reject function.*/
function processGitHubRepos(pFulfil, pReject)
{
	fulfill = (UDF === pFulfil) ? fFulfil : pFulfil; 
	reject = (UDF === pReject) ? fReject : pReject;
	/*EXAMPLE User specific methods:*/
	//github.user.get({}, function(e, r) { console.log((null!==e)?"ERROR ? User Call: ":"User Details: ", (null!==e)?e:r); });
	//github.user.getFollowingFromUser({user: "aphorise"}, function(e, r) { console.log(JSON.stringify(r)); });
	/*EXAMPLE: GET all user repo's:*/ //github.repos.getAll( {per_page: "100"}, function(e, r) { parseRepos(e, r); } );
	//github.repos.getFromUser( {per_page: "100", user: sUID}, function(e, r) { parseRepos(e, r); } );
	github.repos.getFromOrg( {per_page: "100", org: sORG, type: "member"}, function(e, r) { parseRepos(e, r, false); } );
}

var f_SysT2=Date.now()/1000-f_SysT1;  // measuring init times here
console.log(sMsgWelcome);
console.log(sMsgInit, f_SysT2, sL);

process.on("exit", function ()
{
	var sQUIT = sCC+"TSR "+sCNB+"Time"+sCN+" in Seconds: " +sCNB+(Date.now()/1000-f_SysT1).toString()+sCN+"\n";
	console.log(sQUIT);
});
