import { NgModule } from '@angular/core';

import { ImagenPipe } from '../pipes/imagen.pipe';


@NgModule({
  declarations: [ ImagenPipe ],
  exports: [ ImagenPipe ]
})
export class PipesModule { }
