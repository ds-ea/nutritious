import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { describeError } from './app/core/log-format';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  // If bootstrap fails the app is a blank screen and this is the only diagnostic there is, so
  // it has to survive Capacitor's console bridge rather than arrive as [object Object].
  .catch(err => console.error(`[app] bootstrap failed: ${ describeError(err) }`));
