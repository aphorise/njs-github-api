var bTTY = Boolean(process.stdout.isTTY); // execution in terminal?
function sRaw(msg) { return bTTY ? msg : msg.replace( /\033\[[0-9;]*m/g, "" ); } /* strip TTY ANSI colours if not in shell. */
var sCR=""+sRaw("\033[31m"), /*Red*/ sCC=""+sRaw("\033[36m"); /* Cyan */
var sCDG=""+sRaw("\033[90m"),/*Dark Gray*/ sCG=""+sRaw("\033[32m"); /* Green */
var sCN=""+sRaw("\033[0m"),  /*Natural*/ sCNB=""+sRaw("\033[1m"); /* Natural Bold */
var sCP=""+sRaw("\033[35m"), /*Purple*/ sCY=""+sRaw("\033[33m"); /* Yellow */
var sCRBG=""+sRaw("\033[41");/* Red Background White Text */
var sMsgErrReq=sCR+"ERROR "+sCN+"loading required: "+sCNB+"modules"+sCN+"\nDid you -> npm install <- ?";
//----------------------------------------------------------------
/* Packages Required: */
//----------------------------------------------------------------
var mGITHUB;
try{ mGITHUB = require("github"); }
catch (e){ console.log(sMsgErrReq + "\n" + e); process.exit(1); }
//----------------------------------------------------------------
var github = new mGITHUB({ version: "3.0.0" });

var sTAG = "develop";
var sORG = "vigour-io";
var sUID = "github_user-id";	// USER-ID
var sUPS = "github_user-secret";	//USER-SECRET
var sPKG = "package.json";	//FILE / package.json to check
var sPKGPATH1 = "vigour";	//specific JSON path { "vigour" : .... }
var sPKGPATH2 = "category";	//sub-specifics path { "vigour" : { "services" : ... } }
var sPKGPATH2_VALUE = "services";  
var sUTK = "111c00c0007abcdefg123456789abcd12345efff";	//USER-TOKEN if used in place of credentials. 
var gitUsrRepos;
var gitOrgRepos;
var gitOrgDone = false;
var gitOrgPageRepo = 1;

github.authenticate({ "type": "basic", "username": sUID, password: sUPS}); 
//github.authenticate({ "type": "oauth", "token": sUTK});

/* Look for specific path in JSON of requested file (package.json). @param String git-user. @param String git-repo */
function gitCheckContent(sGitUser, sGitRepo)
{
	github.repos.getContent
	(
		{ user: sGitUser, repo: sGitRepo, path: sPKG, ref: sTAG },
		function(e, r)
		{
			if (undefined === e || null === e)
			{
				var b = new Buffer(r.content, "base64");
				var s = b.toString();
				var oJson = JSON.parse(s); 
				if (undefined !== oJson[sPKGPATH1])
				{
					if (undefined !== oJson[sPKGPATH1][sPKGPATH2] && sPKGPATH2_VALUE === oJson[sPKGPATH1][sPKGPATH2])
					{
						console.log(oJson.name + " <-- HAS: .vigour.category == services - IN package.json");
						//console.log(oJson[sPKGPATH1][sPKGPATH2]);
					}
				}
			}
		}
	);
}

/* Callback to parse getRepo related calls. @param String error. @param String response. @param Boolean true if a user.*/
function parseRepos(e, r, bIsUser)
{
	if (null !== e) { console.log("ERROR call failed.", e); return ; }
	else
	{
		delete(r.meta);
		if (undefined === bIsUser || true === bIsUser)
		{ gitUsrRepos = r; console.log("TOTAL Public USER Repo's: " + r.length); }
		else
		{ 
			if (!gitOrgDone)
			{
				if (undefined === gitOrgRepos) { gitOrgRepos = r; }
				else
				{
					for (var iR = 0; iR < r.length; ++iR) { gitOrgRepos.push(r[iR]); }
					if (r.length === 0 || r.length < 100)
					{
						gitOrgDone = true;
						console.log("TOTAL Private ORG Repo's: " + gitOrgRepos.length);
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
					console.log("100 or more REPO's ... checking more.");
					++gitOrgPageRepo;
					github.repos.getFromOrg( {per_page: "100", org: "vigour-io", type: "member", page: "2"}, function(e, r) { parseRepos(e, r, false); } );
				}
			}
		}
	}
	
	if ( undefined !== gitOrgRepos && gitOrgDone)
	{
		for (var iX=0; iX < gitOrgRepos.length; ++iX)
		{
			gitCheckContent(gitOrgRepos[iX].owner.login, gitOrgRepos[iX].name);
		}
	}
}

/* User specific calls / methods : */
//github.user.get({}, function(e, r) { console.log((null!==e)?"ERROR ? User Call: ":"User Details: ", (null!==e)?e:r); });
//github.user.getFollowingFromUser({user: "aphorise"}, function(e, r) { console.log(JSON.stringify(r)); });
/* GET all repositories related to a user account */
// github.repos.getAll( {per_page: "100"}, function(e, r) { parseRepos(e, r); } );
github.repos.getFromOrg( {per_page: "100", org: "vigour-io", type: "member"}, function(e, r) { parseRepos(e, r, false); } );
github.repos.getFromUser( {per_page: "100", user: sUID}, function(e, r) { parseRepos(e, r); } );
