using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace BackofficeAutoLocalizer;

/// <param name="TypeKeys">Content types to include, plus their compositions. Leave out for all types.</param>
public record PlanRequest(Guid[]? TypeKeys);

/// <param name="TypeKeys">The same types the plan was made for, so the server plans the same keys.</param>
public record ApplyRequest(Guid[]? TypeKeys, RowRef[] Rows);

[ApiController]
[ApiVersion("1.0")]
[BackOfficeRoute($"{Composer.ApiName}/api/v{{version:apiVersion}}")]
[ApiExplorerSettings(GroupName = "Localizer")]
[MapToApi(Composer.ApiName)]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
public sealed class LocalizerController(Localizer localizer, IBackOfficeSecurityAccessor security) : ControllerBase
{
	[HttpPost("plan")]
	[Authorize(Policy = AuthorizationPolicies.TreeAccessDocumentTypes)]
	public Task<List<PlanRow>> Plan(PlanRequest request) => localizer.PlanAsync(request.TypeKeys);

	[HttpGet("types")]
	[Authorize(Policy = AuthorizationPolicies.TreeAccessDocumentTypes)]
	public Task<List<TypeSummary>> Types() => localizer.TypesAsync();

	[HttpPost("apply")]
	[Authorize(Policy = AuthorizationPolicies.TreeAccessDocumentTypes)]
	[Authorize(Policy = AuthorizationPolicies.TreeAccessDictionary)]
	public Task<ApplyResult> Apply(ApplyRequest request) => localizer.ApplyAsync(request.TypeKeys, request.Rows, UserKey);

	[HttpPost("revert")]
	[Authorize(Policy = AuthorizationPolicies.TreeAccessDocumentTypes)]
	[Authorize(Policy = AuthorizationPolicies.TreeAccessDictionary)]
	public Task<RevertResult> Revert(PlanRequest request) => localizer.RevertAsync(request.TypeKeys, UserKey);

	[HttpGet("usage")]
	[Authorize(Policy = AuthorizationPolicies.TreeAccessDictionary)]
	public List<UsageRow> Usage([FromQuery] string key) => localizer.Usage(key);

	private Guid UserKey => security.BackOfficeSecurity?.CurrentUser?.Key
		?? throw new InvalidOperationException("No current backoffice user.");
}
