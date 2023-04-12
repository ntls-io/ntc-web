import { Injectable } from '@angular/core';
import Ajv from 'ajv';
const ajv = new Ajv();

@Injectable({
  providedIn: 'root'
})
export class AjvService {
  constructor() {}

  readAsText(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  async validateSchemaFile(schema: Blob) {
    const schemaFileAsText = await this.readAsText(schema);
    const schemaFileObject = JSON.parse(schemaFileAsText);
    const validate = await ajv.validateSchema(schemaFileObject);
    return {
      success: validate,
      error: ajv.errorsText(ajv.errors)
    };
  }

  async validateJsonDataAgainstSchema(dataFile: Blob, schemaFile: Blob) {
    const data = await this.readAsText(dataFile);
    const schema = await this.readAsText(schemaFile);

    const validate = ajv.compile(JSON.parse(schema));

    const result = {
      success: validate(JSON.parse(data)),
      error: ajv.errorsText(validate.errors)
    };
    return result;
  }
}
