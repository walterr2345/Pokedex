import { IsPositive, IsString, MinLength, IsInt, Min } from "class-validator"


export class CreatePokemonDto {

    @IsInt()
    @Min(1)
    @IsPositive()
    no: number

    @IsString()
    @MinLength(1)
    name: string


}
