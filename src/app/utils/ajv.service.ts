import { Injectable } from "@angular/core";
import Ajv from "ajv";
const ajv = new Ajv();

@Injectable({
  providedIn: "root"
})
export class AjvService {
  constructor() {}

  readAsText(file: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  async validateSchemaFile(schema: Blob) {
    const schemaFileAsText = (await this.readAsText(schema)) as string;
    const schemaFileObject = JSON.parse(schemaFileAsText);
    const validate = await ajv.validateSchema(schemaFileObject);
    return {
      success: validate,
      error: ajv.errorsText(ajv.errors)
    };
  }

  // async validateJsonDataAgainstSchema(dataFile: Blob, schemaFile: Blob) {
  //   const data = (await this.readAsText(dataFile)) as string;
  //   const schema = (await this.readAsText(schemaFile)) as string;

  //   const validate = compile(JSON.parse(schema));

  //   const result = {
  //     success: validate(JSON.parse(data)),
  //     error: errorsText(validate.errors)
  //   };
  //   return result;
  // }
}
