var sMsgErrReq="ERROR "+"loading required: modules.\nDid you -> npm install <- ?\n";
//----------------------------------------------------------------
/* Packages Required: */
//----------------------------------------------------------------
var mGIT;
try{ mGIT = require("./index.js"); }
catch(e){ console.log(sMsgErrReq + "\n" + e); process.exit(1); }

var oRepos = [];
function fFulfil() { console.log("We got: %s <-- Repositories applicable", oRepos.length); }
function fReject(e){ { console.log("\nERROR! failed with: %s\n", e); } }

mGIT.getGitHubRepos
(
	"develop", "vigour-io",
	"111c00c0007abcdefg123456789abcd12345efff",
	undefined, undefined,
	oRepos, fFulfil, fReject
);
