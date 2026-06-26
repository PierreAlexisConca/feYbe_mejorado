import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  editar(id: number, producto: Producto) {
    return this.http.put(`${this.api}/${id}`, producto);
  }

  private api = '/api/productos';

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<any[]>(this.api);
  }

  obtener(id: number) {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  crear(data: any) {
    return this.http.post(this.api, data);
  }

  actualizar(id: number, data: any) {
    return this.http.put(`${this.api}/${id}`, data);
  }

  eliminar(id: number) {
    return this.http.patch(`${this.api}/${id}/delete`, {});
  }

  restaurar(id: number) {
    return this.http.patch(`${this.api}/${id}/restore`, {});
  }

  eliminarFisico(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}