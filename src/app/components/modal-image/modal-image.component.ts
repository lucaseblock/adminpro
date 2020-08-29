import { Component, OnInit } from '@angular/core';
import { ModalImagenService } from '../../services/modal-imagen.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-image',
  templateUrl: './modal-image.component.html',
  styles: [
  ]
})
export class ModalImageComponent implements OnInit {

  public imagenSubir: File;
  public imgTemp: any = null;

  constructor( public modalImagenService: ModalImagenService, public fileUploadService: FileUploadService ) { }

  ngOnInit(): void {
  }

  cerrarModal() {
    this.imgTemp = null;
    this.modalImagenService.cerrarModal();
  }

  cambiarImagen( file: File ) {
    this.imagenSubir = file;

    if (!file) { return this.imgTemp = null; };

    const reader = new FileReader();

    reader.readAsDataURL( file );

    reader.onloadend = () => {
      this.imgTemp = reader.result;
      console.log( reader.result );
    }

  }

  subirImagen( ) {

    const id = this.modalImagenService.id;
    const tipo = this.modalImagenService.tipo;

    this.fileUploadService.actualizarFoto( this.imagenSubir, 'usuarios', id )
    .then( img =>  {
      Swal.fire('Guardado', 'Imagen actualizada', 'success');

      this.modalImagenService.nuevaImagen.emit( img );

      this.cerrarModal();
    }).catch( err => {
      Swal.fire('Error', err.error.msg, 'error');
    });
  }
 

}
