using Asp.Versioning;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Infrastructure.Manifest;

namespace BackofficeAutoLocalizer;

internal sealed class Composer : IComposer
{
	public const string ApiName = "backoffice-auto-localizer";

	public void Compose(IUmbracoBuilder builder)
	{
		builder.Services.AddSingleton<IPackageManifestReader, LocalizationReader>();
		builder.AddNotificationHandler<DictionaryCacheRefresherNotification, ClearManifestCache>();
		builder.AddNotificationHandler<ContentTypeCacheRefresherNotification, ClearManifestCache>();
		builder.Services.AddSingleton<Localizer>();

		// Served at /umbraco/swagger/backoffice-auto-localizer/swagger.json for client generation.
		builder.Services.AddSingleton<IOperationIdHandler, ActionNameOperationIds>();
		builder.Services.Configure<SwaggerGenOptions>(options =>
		{
			options.SwaggerDoc(ApiName, new OpenApiInfo { Title = "Backoffice Auto Localizer", Version = "1.0" });
			options.OperationFilter<SecurityFilter>();
		});
	}

	private sealed class SecurityFilter : BackOfficeSecurityRequirementsOperationFilterBase
	{
		protected override string ApiName => Composer.ApiName;
	}

	/// <summary>Operation ids are the action names, so the generated client reads <c>LocalizerService.plan()</c>.</summary>
	private sealed class ActionNameOperationIds(IOptions<ApiVersioningOptions> versioning) : OperationIdHandler(versioning)
	{
		protected override bool CanHandle(ApiDescription apiDescription, ControllerActionDescriptor descriptor)
			=> descriptor.ControllerTypeInfo == typeof(LocalizerController);

		public override string Handle(ApiDescription apiDescription)
			=> apiDescription.ActionDescriptor.RouteValues["action"]!;
	}
}
