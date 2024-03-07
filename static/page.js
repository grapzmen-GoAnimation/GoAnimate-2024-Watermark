const fUtil = require("../misc/file");
const stuff = require("./info");
const http = require("http");

function toAttrString(table) {
	return typeof table == "object"
		? Object.keys(table)
				.filter((key) => table[key] !== null)
				.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(table[key])}`)
				.join("&")
		: table.replace(/"/g, '\\"');
}
function toParamString(table) {
	return Object.keys(table)
		.map((key) => `<param name="${key}" value="${toAttrString(table[key])}">`)
		.join(" ");
}
function toObjectString(attrs, params) {
	return `<object id="obj" ${Object.keys(attrs)
		.map((key) => `${key}="${attrs[key].replace(/"/g, '\\"')}"`)
		.join(" ")}>${toParamString(params)}</object>`;
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {import("url").UrlWithParsedQuery} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET") return;
	const query = url.query;

	var attrs, params, title;
	switch (url.pathname) {		
		case "/go_full": {
			let presave =
				query.movieId && query.movieId.startsWith("m")
					? query.movieId
					: `m-${fUtil[query.noAutosave ? "getNextFileId" : "fillNextFileId"]("movie-", ".xml")}`;
			title = "Video Editor";
			attrs = {
				data: process.env.SWF_URL + "/go_full.swf",
				type: "application/x-shockwave-flash",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					apiserver: "http://localhost/",
					storePath: process.env.STORE_URL + "/<store>",
					isEmbed: 1,
					ctc: "go",
					ut: 50,
					bs: "default",
					appCode: "go",
					page: "",
					siteId: "go",
					lid: 13,
					isLogin: "Y",
					retut: 0,
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					themeId: "business",
					tlang: "en_US",
					presaveId: presave,
					goteam_draft_only: 1,
					isWide: 1,
					collab: 0,
					nextUrl: "/movie/?movieId=<presaveId>",
					noSkipTutorial: 1,
				},
				allowScriptAccess: "always",
			};
			break;
		}
		default:
			return;
	}
	res.setHeader("Content-Type", "text/html; charset=UTF-8");
	Object.assign(params.flashvars, query);
	res.end(`
	<head>
	<script>document.title='${title}',flashvars=${JSON.stringify(
			params.flashvars
		)}</script>
<link rel="stylesheet" type="text/css" href="/html/css/common_combined.css.gz.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:400,700">
<link rel="stylesheet" href="/html/css/importer.css.gz.css">
<link rel="stylesheet" href="/html/css/studio.css.gz.css">
<script href="/html/js/common_combined.js.gz.js"></script>
</head>

                </li>
            </ul>
        </div>
    </div>
</nav>
${toObjectString(attrs, params)}
</body>${stuff.pages[url.pathname] || ""}`
	);
	return true;
};
